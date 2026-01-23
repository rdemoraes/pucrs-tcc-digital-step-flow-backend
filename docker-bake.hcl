variable "DOCKER_HUB_USERNAME" {
  default = "raphaelmoraes"
}

# Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
# Example: 1.0.0, 1.2.3, 2.0.0
# See: https://semver.org/
variable "BASE_IMAGE_VERSION" {
  default = ""
}

# Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
# Example: 1.0.0, 1.2.3, 2.0.0
# See: https://semver.org/
variable "BACKEND_IMAGE_VERSION" {
  default = ""
}

function "major" {
  params = [version]
  result = length(split(".", version)) > 0 ? split(".", version)[0] : version
}

function "minor" {
  params = [version]
  result = length(split(".", version)) >= 2 ? join(".", slice(split(".", version), 0, 2)) : version
}

group "default" {
  targets = [
    "backend"
  ]
}

target "_common_app" {
  labels = {
    "org.opencontainers.image.authors": "Digital Step Flow Team",
    "org.opencontainers.image.created": timestamp(),
    "org.opencontainers.image.title": "digital-step-flow-backend",
    "org.opencontainers.image.vendor": "Digital Step Flow",
    "org.opencontainers.image.version": BACKEND_IMAGE_VERSION
  }
}

target "backend" {
  inherits = ["_common_app"]
  args = {
    BASE_IMAGE_PROD = "${DOCKER_HUB_USERNAME}/digital-step-flow-base-node:${BASE_IMAGE_VERSION}"
    BASE_IMAGE_DEV = "${DOCKER_HUB_USERNAME}/digital-step-flow-base-node:${BASE_IMAGE_VERSION}-dev"
  }
  tags = [
    "${DOCKER_HUB_USERNAME}/digital-step-flow-backend:${BACKEND_IMAGE_VERSION}",
    "${DOCKER_HUB_USERNAME}/digital-step-flow-backend:${major(BACKEND_IMAGE_VERSION)}",
    "${DOCKER_HUB_USERNAME}/digital-step-flow-backend:${minor(BACKEND_IMAGE_VERSION)}"
  ]
  pull = true
  dockerfile = "Dockerfile"
  context = "."
  platforms = [
    "linux/amd64",
    "linux/arm64"
  ]
}
