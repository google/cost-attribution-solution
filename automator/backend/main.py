# Copyright 2025 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from google.api_core.exceptions import GoogleAPICallError
from starlette.responses import JSONResponse

from routes import tags, tag_bindings

app = FastAPI()


# --- Exception Handlers ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    logging.exception(exc)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(GoogleAPICallError)
async def google_api_call_error_handler(_: Request, exc: GoogleAPICallError):
    logging.exception(exc)
    return JSONResponse(
        status_code=500,
        content={"details": exc.message},
    )


@app.exception_handler(Exception)
async def generic_error_handler(_: Request, exc: Exception):
    logging.exception(exc)
    return JSONResponse(
        status_code=500,
        content={"details": "Internal server error"},
    )


# --- Health Check ---
@app.get("/api/health")
async def get_health():
    """Health endpoint."""
    return {"detail": "OK"}


# --- Include Routers ---
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(tag_bindings.router, prefix="/api/resources", tags=["resources"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
