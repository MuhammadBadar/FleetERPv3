$ErrorActionPreference = 'Stop'
$solutionRoot = Split-Path -Parent $PSScriptRoot
$apiDll = Join-Path $solutionRoot 'src\TMS.Api\bin\Release\net9.0\TMS.Api.dll'
if (-not (Test-Path -LiteralPath $apiDll)) { throw 'Build Release before running smoke.ps1.' }
$stdout = Join-Path ([IO.Path]::GetTempPath()) ('tms-smoke-' + [guid]::NewGuid() + '.log')
$stderr = $stdout + '.err'
$apiProcess = Start-Process dotnet -ArgumentList @('"' + $apiDll + '"', '--urls=http://localhost:5088', '--Storage:Provider=InMemory') -WorkingDirectory $solutionRoot -PassThru -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr
function Assert-True($Condition, $Message) { if (-not $Condition) { throw $Message } }
function Send-Json($Method, $Uri, $Body) {
    Invoke-WebRequest -Method $Method -Uri $Uri -ContentType 'application/json' -Body ($Body | ConvertTo-Json) -SkipHttpErrorCheck
}
try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        $apiProcess.Refresh()
        if ($apiProcess.HasExited) { throw ('API exited: ' + (Get-Content -LiteralPath $stderr -Raw)) }
        try {
            $health = Invoke-RestMethod 'http://localhost:5088/health'
            if ($health.storage -eq 'InMemory') { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    Assert-True $ready 'API did not become ready.'
    $body = @{title='Smoke task'; sp=2; statusId=1107001; priorityId=1108003}
    $createdResponse = Send-Json POST 'http://localhost:5088/api/tasks?clientId=41' $body
    Assert-True ($createdResponse.StatusCode -eq 201) 'Create must return 201.'
    $created = $createdResponse.Content | ConvertFrom-Json
    $uri = 'http://localhost:5088/api/tasks/' + $created.id + '?clientId=41'
    $get = Invoke-RestMethod $uri
    Assert-True ($get.title -eq 'Smoke task') 'GET did not return the created task.'
    $other = Invoke-WebRequest ('http://localhost:5088/api/tasks/' + $created.id + '?clientId=42') -SkipHttpErrorCheck
    Assert-True ($other.StatusCode -eq 404) 'Other client must not see task.'
    $body.title = 'Updated task'
    $updated = Send-Json PUT $uri $body
    Assert-True ($updated.StatusCode -eq 200) 'Update failed.'
    Assert-True (($updated.Content | ConvertFrom-Json).createdOn -eq $created.createdOn) 'CreatedOn changed.'
    $invalid = Send-Json POST 'http://localhost:5088/api/tasks' @{title=' ';sp=-1}
    Assert-True ($invalid.StatusCode -eq 400) 'Invalid input must return 400.'
    $deleted = Invoke-WebRequest -Method DELETE -Uri $uri -SkipHttpErrorCheck
    Assert-True ($deleted.StatusCode -eq 204) 'Delete failed.'
    $missing = Invoke-WebRequest -Uri $uri -SkipHttpErrorCheck
    Assert-True ($missing.StatusCode -eq 404) 'Deleted task must return 404.'
    Write-Output 'PASS: HTTP create, read, update, delete, validation, and client isolation.'
} finally {
    $apiProcess.Refresh()
    if (-not $apiProcess.HasExited) { Stop-Process -Id $apiProcess.Id }
}

