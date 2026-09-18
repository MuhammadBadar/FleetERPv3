namespace TMS.Application.Common;
public sealed class RepositoryConflictException(string message, Exception? inner = null) : Exception(message, inner);
public sealed class RepositoryUnavailableException(string message, Exception? inner = null) : Exception(message, inner);

