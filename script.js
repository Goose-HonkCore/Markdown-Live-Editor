document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const markdownInput = document.getElementById('markdown-input');
    const preview = document.getElementById('preview');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    const toggleCheatsheetBtn = document.getElementById('toggle-cheatsheet');
    const cheatsheetModal = document.getElementById('cheatsheet-modal');
    const closeCheatsheetBtn = document.getElementById('close-cheatsheet');
    const copyMarkdownBtn = document.getElementById('copy-markdown');
    const copyHtmlBtn = document.getElementById('copy-html');
    const clearMarkdownBtn = document.getElementById('clear-markdown');
    const downloadHtmlBtn = document.getElementById('download-html');

    // Default markdown content for first-time visitors
    const defaultMarkdown = `# Welcome to Markdown Live Editor!

This is a simple, lightweight Markdown editor with live preview.

## Features
- Real-time preview as you type
- Dark/Light mode toggle
- Markdown cheatsheet
- Copy to clipboard functionality
- Download HTML option
- Syntax highlighting for code blocks

## Code Example
\`\`\`javascript
// This is a code block with syntax highlighting
function greet(name) {
    return \`Hello, \${name}!\`;
}
console.log(greet('Developer'));
\`\`\`

## Table Example
| Feature | Description |
|---------|-------------|
| Live Preview | See your markdown rendered in real-time |
| Dark Mode | Easy on the eyes when coding at night |
| Cheatsheet | Quick reference for markdown syntax |

> **Tip:** Click the "Markdown Cheatsheet" button below for a quick reference.

**Thanks for using this tool!** 

Created by a developer for developers.

---

_You can clear this example by clicking the trash icon above._
`;

    // Initialize marked.js options
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        highlight: function(code, language) {
            if (language && hljs.getLanguage(language)) {
                return hljs.highlight(code, { language }).value;
            }
            return hljs.highlightAuto(code).value;
        }
    });

    // Initialize with default content if localStorage is empty
    if (!localStorage.getItem('markdown-content')) {
        markdownInput.value = defaultMarkdown;
        localStorage.setItem('markdown-content', defaultMarkdown);
    } else {
        markdownInput.value = localStorage.getItem('markdown-content');
    }

    // Initialize with saved theme if available
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    // Initial render
    renderMarkdown();

    // Event Listeners
    markdownInput.addEventListener('input', function() {
        renderMarkdown();
        saveToLocalStorage();
    });

    themeToggleBtn.addEventListener('click', toggleTheme);
    
    toggleCheatsheetBtn.addEventListener('click', function() {
        cheatsheetModal.style.display = 'flex';
    });

    closeCheatsheetBtn.addEventListener('click', function() {
        cheatsheetModal.style.display = 'none';
    });

    cheatsheetModal.addEventListener('click', function(e) {
        if (e.target === cheatsheetModal) {
            cheatsheetModal.style.display = 'none';
        }
    });

    copyMarkdownBtn.addEventListener('click', function() {
        copyToClipboard(markdownInput.value, 'Markdown copied to clipboard!');
    });

    copyHtmlBtn.addEventListener('click', function() {
        copyToClipboard(preview.innerHTML, 'HTML copied to clipboard!');
    });

    clearMarkdownBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
            markdownInput.value = '';
            renderMarkdown();
            saveToLocalStorage();
        }
    });

    downloadHtmlBtn.addEventListener('click', function() {
        downloadHtml();
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save HTML
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadHtml();
        }
        
        // Esc to close modal
        if (e.key === 'Escape' && cheatsheetModal.style.display === 'flex') {
            cheatsheetModal.style.display = 'none';
        }
    });

    // Functions
    function renderMarkdown() {
        try {
            // Sanitize and render markdown
            const sanitizedContent = DOMPurify.sanitize(marked.parse(markdownInput.value));
            preview.innerHTML = sanitizedContent;
            
            // Apply syntax highlighting to code blocks
            document.querySelectorAll('#preview pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
            // Convert task lists
            document.querySelectorAll('#preview li').forEach((listItem) => {
                const text = listItem.textContent;
                if (text.startsWith('[ ] ')) {
                    listItem.innerHTML = `<input type="checkbox" disabled> ${listItem.innerHTML.substring(3)}`;
                } else if (text.startsWith('[x] ') || text.startsWith('[X] ')) {
                    listItem.innerHTML = `<input type="checkbox" checked disabled> ${listItem.innerHTML.substring(3)}`;
                }
            });
        } catch (error) {
            console.error('Error rendering markdown:', error);
            preview.innerHTML = `<p class="error">Error rendering markdown: ${error.message}</p>`;
        }
    }

    function toggleTheme() {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    }

    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification(successMessage);
            })
            .catch(err => {
                showNotification('Failed to copy: ' + err.message, 'error');
            });
    }

    function saveToLocalStorage() {
        localStorage.setItem('markdown-content', markdownInput.value);
    }

    function downloadHtml() {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Generated HTML</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        pre {
            background-color: #f5f7f9;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f5f7f9;
            padding: 2px 4px;
            border-radius: 3px;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #6366f1;
            padding-left: 15px;
            color: #6b7280;
            margin: 20px 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f5f7f9;
        }
        img {
            max-width: 100%;
        }
        a {
            color: #6366f1;
        }
    </style>
</head>
<body>
    ${preview.innerHTML}
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown-export.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('HTML file downloaded successfully!');
    }

    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.3s';
        
        if (type === 'success') {
            notification.style.backgroundColor = '#10b981';
            notification.style.color = 'white';
        } else {
            notification.style.backgroundColor = '#ef4444';
            notification.style.color = 'white';
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add DOMPurify library
    if (!window.DOMPurify) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js';
        script.onload = function() {
            renderMarkdown();
        };
        document.head.appendChild(script);
    }
});