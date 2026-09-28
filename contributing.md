# Contributing Guidelines

Thank you for your interest in contributing to this project!  
We welcome beginners and experienced developers alike. Here's a step-by-step guide to help you get started.
---
## 1. Fork the Repository
Forking means creating your own copy of the project on GitHub.
- Click the **"Fork"** button on the top-right corner of this repository.
- This creates a copy under your GitHub account.
- **Important:** Make sure to fork from the **"gssoc"** branch, not the main branch.
---
## 2. Clone Your Fork Locally
- Cloning brings the code from GitHub to your local computer.
- Open your terminal or Git Bash and run:
```bash
git clone https://github.com/your-username/project-name.git
```
- Replace:
  - `your-username` with your GitHub username
  - `project-name` with the name of the repository
- Now, go into the project folder:
```bash
cd project-name
```
- Switch to the gssoc branch:
```bash
git checkout gssoc
```
---
## 3. Create a New Branch
- Never work directly on the `gssoc` branch. Create a new branch for your changes:
```bash
git checkout -b feature-name
```
- Replace `feature-name` with a name related to the change you're making.
---
## 4. Make Your Changes
- Open the project in your code editor, make your changes, and save the files.
---
## 5. Stage and Commit Your Changes
- In your terminal, run:
```bash
git add .
```
- Then commit your changes with a meaningful message (For example):
```bash
git commit -m "Added CONTRIBUTING.md with detailed gssoc steps"
```
---
## 6. Push Your Changes to GitHub
- Send your changes to your GitHub forked repository:
```bash
git push origin feature-name
```
---
## 7. Open a Pull Request (PR)
- Go to your forked repository on GitHub.
- You'll see a "Compare & pull request" button. Click it.
- **Important:** Make sure your PR is targeting the **"gssoc"** branch of the original repository, not the main branch.
- Fill in the title and description:
  - Mention the issue you're fixing.
  - Describe what you changed and why.
  - Add screenshots if it's a UI change.
- Click "Create Pull Request".
---
## 8. Wait for Review
- Admin will review your PR.
- Submit a couple of screenshots & screen recordings of the resolved issue, in order to get a fast response and quick merging of the issue
- They may suggest changes. You can make them in the same branch and push again.
- Once approved, your PR will be merged into the gssoc branch! 
---
Thank you for contributing! 🌟
One pull request at a time!
---
