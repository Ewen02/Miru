export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends DomainException {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;

  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
  }
}

export class ConflictException extends DomainException {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;

  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenException extends DomainException {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;

  constructor(message?: string) {
    super(message ?? "Access denied");
  }
}
