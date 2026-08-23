import type { RequestHandler } from "express";

const asyncHandler = (controllerFunc: RequestHandler): RequestHandler => {
  return (request, response, next) => {
    Promise.resolve(controllerFunc(request, response, next)).catch(next);
  };
};

export default asyncHandler;