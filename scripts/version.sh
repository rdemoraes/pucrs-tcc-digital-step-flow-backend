#!/usr/bin/env bash

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

# Determine version based on branch strategy
# This function implements Semantic Versioning (SemVer) based on branch naming:
# - breaking/* or breaking-*: Major bump
# - feature/* or feature-*: Minor bump
# - hotfix/* or hotfix-*: Patch bump
# - Default: Patch bump for main/develop direct pushes
#
# Usage:
#   determine_version <ref_type> <ref> <head_ref> <pr_head_ref> <ref_name>
#
# Arguments:
#   ref_type: Type of ref (tag or branch)
#   ref: Full ref path (e.g., refs/tags/v1.0.0 or refs/heads/main)
#   head_ref: Head ref from event (for PR merges)
#   pr_head_ref: PR head ref from event
#   ref_name: Short ref name
#
# Output:
#   Sets GITHUB_OUTPUT variable 'version' with the determined version
determine_version() {
    local ref_type="${1:-}"
    local ref="${2:-}"
    local head_ref="${3:-}"
    local pr_head_ref="${4:-}"
    local ref_name="${5:-}"
    
    # If this is a tag push, use the tag version
    if [[ "$ref_type" == "tag" ]]; then
        local version="${ref#refs/tags/v}"
        echo "version=${version}" >> "$GITHUB_OUTPUT"
        log_info "Using tag version: ${version}"
        return 0
    fi
    
    # Fetch all tags to ensure we have the latest
    log_info "Fetching all tags..."
    git fetch --tags --force || log_warn "Failed to fetch tags, continuing with local tags"
    
    # Get the latest tag (sorted by version)
    local latest_tag
    latest_tag=$(git tag --sort=-version:refname | head -n 1 || echo "")
    
    # If no tag exists, start with 0.0.0
    if [[ -z "$latest_tag" ]]; then
        log_warn "No tags found. Creating initial tag 0.0.0"
        local version="0.0.0"
        
        # Create and push the initial tag (if we have write permissions)
        if git config --get user.name > /dev/null 2>&1; then
            log_info "Creating initial tag v${version}"
            git tag -a "v${version}" -m "Initial version ${version}" || log_warn "Failed to create tag locally"
            
            # Try to push the tag (may fail if tag already exists remotely)
            if git push origin "v${version}" 2>/dev/null; then
                log_success "Created and pushed initial tag v${version}"
            else
                log_warn "Tag push failed (may already exist remotely)"
            fi
        else
            log_warn "Git user not configured, skipping tag creation"
        fi
    else
        # Remove 'v' prefix if present
        local latest_version="${latest_tag#v}"
        log_info "Latest version found: ${latest_version}"
        
        # Parse version components
        IFS='.' read -r -a version_parts <<< "$latest_version"
        local major="${version_parts[0]:-0}"
        local minor="${version_parts[1]:-0}"
        local patch="${version_parts[2]:-0}"
        
        # Determine bump type based on source branch
        # Priority: head_ref (PR merge) > pr_head_ref (PR event) > ref_name (current branch)
        local source_branch="${head_ref:-${pr_head_ref:-${ref_name}}}"
        log_info "Source branch: ${source_branch}"
        
        local bump_type="patch"
        if [[ "$source_branch" == breaking/* ]] || [[ "$source_branch" == breaking-* ]]; then
            # Major bump: breaking changes
            major=$((major + 1))
            minor=0
            patch=0
            bump_type="major"
        elif [[ "$source_branch" == feature/* ]] || [[ "$source_branch" == feature-* ]]; then
            # Minor bump: new features
            minor=$((minor + 1))
            patch=0
            bump_type="minor"
        elif [[ "$source_branch" == hotfix/* ]] || [[ "$source_branch" == hotfix-* ]]; then
            # Patch bump: bug fixes
            patch=$((patch + 1))
            bump_type="patch"
        else
            # Default to patch for main/develop direct pushes
            patch=$((patch + 1))
            bump_type="patch"
        fi
        
        local version="${major}.${minor}.${patch}"
        log_info "Bump type: ${bump_type}"
        log_success "New version: ${version}"
    fi
    
    echo "version=${version}" >> "$GITHUB_OUTPUT"
    log_info "Version determined: ${version}"
    
    return 0
}

# Main function (if script is executed directly)
main() {
    if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
        # Script is being executed directly
        local ref_type="${GITHUB_REF_TYPE:-}"
        local ref="${GITHUB_REF:-}"
        local head_ref="${GITHUB_HEAD_REF:-}"
        local pr_head_ref="${GITHUB_EVENT_PULL_REQUEST_HEAD_REF:-}"
        local ref_name="${GITHUB_REF_NAME:-}"
        
        if [[ -z "$ref_type" ]] || [[ -z "$ref" ]]; then
            log_error "GITHUB_REF_TYPE and GITHUB_REF must be set"
            exit 1
        fi
        
        # Ensure GITHUB_OUTPUT exists
        if [[ -z "${GITHUB_OUTPUT:-}" ]]; then
            export GITHUB_OUTPUT=$(mktemp)
            log_warn "GITHUB_OUTPUT not set, using temporary file: ${GITHUB_OUTPUT}"
        fi
        
        determine_version "$ref_type" "$ref" "$head_ref" "$pr_head_ref" "$ref_name"
        
        # If using temporary file, output the contents
        if [[ -f "$GITHUB_OUTPUT" ]]; then
            cat "$GITHUB_OUTPUT"
        fi
    fi
}

# Run main if script is executed directly
main "$@"

