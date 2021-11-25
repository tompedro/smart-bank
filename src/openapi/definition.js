const { version } = require("../../package.json")

module.exports = {
  openapi: "3.0.3",
  "x-express-openapi-validation-strict": true,
  "x-express-openapi-additional-middleware": [],
  info: {
    title: "Bank Api",
    description: "Bank Api",
    version
  },
  servers: [
    {
      url: "{protocol}://{environment}/{version}",
      variables: {
        protocol: {
          default: "http",
          enum: ["http", "https"]
        },
        environment: {
          default: "localhost:8080",
          enum: ["localhost:8080"]
        },
        version: {
          default: "v1",
          enum: ["v1"]
        }
      }
    }
  ],
  paths: {
    "/docs": {
      get: {
        tags: ["documentation"],
        summary: "Api documentation",
        description: "Retrieve the api documentation",
        operationId: "docs",
        responses: {
          200: {
            description: "Api documentation",
            content: {
              "text/html": {
                schema: {
                  type: "string"
                }
              }
            }
          },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },
    "/docs/definition": {
      get: {
        tags: ["documentation"],
        summary: "Openapi definition",
        description: "Retrieve the openapi definition",
        operationId: "definition",
        responses: {
          200: {
            description: "Openapi definition",
            content: {
              "application/json": {
                schema: {
                  type: "object"
                }
              }
            }
          },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },
    "/health": {
      head: {
        tags: ["health"],
        summary: "API health check",
        description: "API health check",
        operationId: "health",
        responses: {
          200: {
            description: "The API is running",
            content: {
              "text/html": {
                schema: {
                  type: "string"
                }
              }
            }
          },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },

    "/profile/logIn": {
      post: {
        tags: ["profile"],
        summary: "login",
        description: "login",
        operationId: "logIn",
        requestBody: {
          description: "Request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  account: { $ref: "#/components/schemas/account" },
                  pin: { $ref: "#/components/schemas/pin" }
                },
                additionalProperties: false,
                required: ["account", "pin"]
              },
              examples: {
                logIn: {
                  summary: "login",
                  value: {
                    account: "23441",
                    pin: "859"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    JWT: { $ref: "#/components/schemas/JWT" }
                  },
                  required: ["JWT"],
                  additionalProperties: false,
                  example: {
                    JWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          401: { $ref: "#/components/responses/UnauthorizedResponse" },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },

    "/profile/signUp": {
      post: {
        tags: ["profile"],
        summary: "Sign Up",
        description: "Allows the user to register on the site thanks to his name, last name, email and password.",
        operationId: "signUp",
        requestBody: {
          description: "Request is composed by name, last name, email and password",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/user"
              },
              examples: {
                signUp: {
                  summary: "Register on the site.",
                  value: {
                    firstName: "Tommaso",
                    lastName: "Rossi",
                    account: "102309",
                    pin: "102"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    JWT: { $ref: "#/components/schemas/JWT" }
                  },
                  required: ["JWT"],
                  additionalProperties: false,
                  example: {
                    JWT: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                  }
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          403: { $ref: "#/components/responses/ForbiddenResponse" },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }

      }
    },

    "/profile/getInfo": {
      post: {
        tags: ["profile"],
        security: [{ BearerAuth: [] }],
        summary: "Get info",
        description: "Get info",
        operationId: "getInfo",
        requestBody: {
          description: "Request",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: {
                    type: "integer"
                  }
                },
                additionalProperties: false,
                required: ["userId"]
              },
              examples: {
                updateUserInfo: {
                  summary: "Get 1 user",
                  value: {
                    userId: 1
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/user"
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          401: { $ref: "#/components/responses/UnauthorizedResponse" },
          403: { $ref: "#/components/responses/ForbiddenResponse" },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }

      }
    },

    "/transaction/getTransactions": {
      post: {
        tags: ["transaction"],
        security: [{ BearerAuth: [] }],
        summary: "get transactions",
        description: "get transactions",
        operationId: "getTransactions",
        requestBody: {
          description: "userId",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: {
                    type: "integer"
                  }
                },
                additionalProperties: false,
                required: ["userId"]
              },
              examples: {
                getQuestion: {
                  summary: "get a transaction",
                  value: {
                    userId: 2
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    transactions: {
                      type: "array",
                      maxItems: 50,
                      items: {
                        $ref: "#/components/schemas/transaction"
                      }
                    }
                  },
                  additionalProperties: false,
                  required: ["question"]
                }
              }
            }
          },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          404: { $ref: "#/components/responses/NotFoundResponse" },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },

    "/transaction/operate": {
      post: {
        tags: ["transaction"],
        security: [{ BearerAuth: [] }],
        summary: "operate on balance",
        description: "operate on balance",
        operationId: "operate",
        requestBody: {
          description: "userId and value",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: {
                    type: "integer"
                  },
                  value: {
                    $ref: "#/components/schemas/value"
                  }
                },
                additionalProperties: false,
                required: ["userId", "value"]
              },
              examples: {
                getQuestion: {
                  summary: "change balance",
                  value: {
                    userId: 2,
                    value: 3
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { $ref: "#/components/responses/CorrectResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          404: { $ref: "#/components/responses/NotFoundResponse" },
          500: { $ref: "#/components/responses/UnexpectedErrorResponse" }
        }
      }
    },


  },
  // SE CANCELLI QUI HAI IL GAY
  components: {
    requestBodies: {},

    responses: {
      BadRequestResponse: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: {
              oneOf: [
                { $ref: "#/components/schemas/GenericError" },
                { $ref: "#/components/schemas/ValidationError" }
              ]
            }
          }
        }
      },

      UnexpectedErrorResponse: {
        description: "Unexpected error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GenericError" }
          }
        }
      },

      UnauthorizedResponse: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GenericError" }
          }
        }
      },

      ForbiddenResponse: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GenericError" }
          }
        }
      },

      NotFoundResponse: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/GenericError" }
          }
        }
      },

      CorrectResponse: {
        description: "Success",
        content: {
          "text/html": {
            schema: {
              type: "string"
            }
          }
        }
      }

    },

    schemas: {

      JWT: {
        type: "string",
        format: "byte",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      },

      dateTime: {
        type: "string",
        format: "date-time",
        example: "2022-01-01T00:00:00Z"
      },

      name: {
        type: "string"
      },

      lastName: {
        type: "string"
      },

      id: {
        type: "number"
      },

      account: {
        type: "string"
      },

      pin: {
        type: "string"
      },

      value:{
        type: "number"
      },

      user: {
        type: "object",
        properties: {
          id: {
            $ref: "#/components/schemas/id"
          },

          firstName: {
            $ref: "#/components/schemas/name"
          },

          lastName: {
            $ref: "#/components/schemas/lastName"
          },

          account: {
            $ref: "#/components/schemas/account"
          },

          pin: {
            $ref: "#/components/schemas/pin"
          },

          balance: {
            $ref: "#/components/schemas/value"
          }

        },
        required: ["firstName", "lastName", "account"],
        additionalProperties: false
      },

      transaction: {
        type: "object",
        properties: {
          id: {
            $ref: "#/components/schemas/id"
          },

          account: {
            $ref: "#/components/schemas/account"
          },

          value: {
            $ref: "#/components/schemas/value"
          }

        },
        required: ["value", "account"],
        additionalProperties: false
      },

      GenericError: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: {
                type: "string"
              },
              message: {
                type: "string",
                nullable: true
              },
              details: {
                type: "string",
                nullable: true
              }
            }
          }
        }
      },

      ValidationError: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: {
                type: "integer"
              },
              message: {
                type: "string"
              },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    path: {
                      type: "string"
                    },
                    errorCode: {
                      type: "string"
                    },
                    message: {
                      type: "string"
                    },
                    location: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
}