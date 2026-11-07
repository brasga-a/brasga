from workers import asgi

from portfolio_api.main import app

Default = asgi.entrypoint(app)
