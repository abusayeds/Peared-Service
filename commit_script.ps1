# Stage modifications and deletions, plus root files
git add -u
git add package.json package-lock.json next.config.mjs postcss.config.mjs tailwind.config.js .eslintrc.json .gitignore README.md .env .env..development
git commit -m "chore: setup new project configurations and remove old files"

# Global state, context, utils
git add src/lib src/context src/redux src/middleware.ts src/assets
git commit -m "feat: add global state, middleware, and assets"

# Components directory
Get-ChildItem -Path src/components -Directory | ForEach-Object {
    git add $_.FullName
    git commit -m "feat(component): add $($_.Name) component"
}
Get-ChildItem -Path src/components -File | ForEach-Object {
    git add $_.FullName
    git commit -m "feat(component): add $($_.Name)"
}

# App directory (Pages)
Get-ChildItem -Path src/app -Directory | ForEach-Object {
    if ($_.Name -eq "(auth)") {
        Get-ChildItem -Path $_.FullName -Directory | ForEach-Object {
            git add $_.FullName
            git commit -m "feat(page): add auth $($_.Name) page"
        }
    } else {
        git add $_.FullName
        git commit -m "feat(page): add $($_.Name) page"
    }
}

# Root app files
Get-ChildItem -Path src/app -File | ForEach-Object {
    git add $_.FullName
}
git commit -m "feat(app): add root layout and configurations"

# Catch all remaining
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "chore: add remaining files"
}

# Push to origin
git push -u origin main
