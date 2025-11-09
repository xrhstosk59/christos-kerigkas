# Project Context & Preferences

## Important Rules

### Development Server
- **NEVER** run `npm run dev` automatically
- Let the user start the development server manually

### Database Operations
- **NEVER** create custom scripts for database operations
- **ALWAYS** use the MCP Server for Supabase operations
- Use Supabase MCP tools for all database queries and migrations

### Build Verification
- **ALWAYS** run `npm run build` after making changes to the project
- This ensures all TypeScript types are correct and the build succeeds
- Catch errors early before deployment

### Documentation
- **ALWAYS** update the README.md when making significant changes to the project
- Document new features, API changes, or configuration updates
- Keep the README current with the project state

### Testing
- **NEVER** create tests or test files
- User will handle testing separately

### Communication
- **NEVER** create markdown files to explain what you did
- User can see the changes directly - no need for detailed summaries
- Be concise and to the point

### Git Commits
- **NEVER** commit changes without asking the user first
- Always ask for permission before running git add/commit/push

---

*This file contains project-specific context and preferences for Claude Code to follow.*
