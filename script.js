document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Theme Toggle Functionality ---
    const themeToggle = document.getElementById('theme-toggle');

    // Function to apply the saved theme
    const applyTheme = (theme) => {
        themeToggle.innerHTML = '';
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            const moonIcon = document.createElement('i');
            moonIcon.className = 'fas fa-moon';
            themeToggle.appendChild(moonIcon);
        } else {
            document.documentElement.removeAttribute('data-theme');
            const sunIcon = document.createElement('i');
            sunIcon.className = 'fas fa-sun';
            themeToggle.appendChild(sunIcon);
        }
    };

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    // Event listener for the theme toggle button
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            localStorage.setItem('theme', 'dark');
            applyTheme('dark');
        } else {
            localStorage.setItem('theme', 'light');
            applyTheme('light');
        }
    });

    // --- 2. Dynamic Dev Log Timeline ---
    const timelineContainer = document.getElementById('timeline-container');

    // Function to render the timeline
    const renderTimeline = (devLogData) => {
        if (timelineContainer) {
            timelineContainer.innerHTML = ''; // Clear loading message
            if (devLogData.length === 0) {
                timelineContainer.innerHTML = `<p class="empty-log-message">No recent activity to show.</p>`;
                return;
            }
            devLogData.slice(0, 5).forEach(item => { // Limit to top 5 items
                const logParagraph = document.createElement('p');
                logParagraph.className = 'log-item-paragraph'; // New class for styling
                logParagraph.innerHTML = `<strong>${item.type}:</strong> ${item.title}`;
                timelineContainer.appendChild(logParagraph);
            });
        }
    };

    // Fetch dev log data from logs.json
    fetch('https://raw.githubusercontent.com/h4r0015k/h4r0015k.github.io/logs/logs.json')
        .then(response => response.json())
        .then(data => {
            renderTimeline(data);
        })
        .catch(error => {
            console.error('Error fetching dev log data:', error);
            if (timelineContainer) {
                timelineContainer.innerHTML = `<p class="empty-log-message">Failed to load recent activity.</p>`;
            }
        });

    // --- 3. Tagline Animation ---
    const taglineElement = document.getElementById('tagline');
    const taglineTextElement = taglineElement.querySelector('.tagline-text');
    const taglines = [
        'SENIOR FULL STACK ENGINEER',
        'AI whisperer and code wrangler.',
        'Building the future, one line of code at a time.',
        'Turning coffee into code.',
        'Making pixels pretty and code smart.',
        'Probably debugging something right now.'
    ];

    let currentTaglineIndex = 0;
    let isDeleting = false;
    let charIndex = 0;

    function type() {
        const currentTagline = taglines[currentTaglineIndex];
        let text = '';

        if (isDeleting) {
            text = currentTagline.substring(0, charIndex - 1);
            charIndex--;
        } else {
            text = currentTagline.substring(0, charIndex + 1);
            charIndex++;
        }

        taglineTextElement.textContent = text;

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentTagline.length) {
            typeSpeed = 2000; // Pause at end of tagline
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentTaglineIndex = (currentTaglineIndex + 1) % taglines.length;
        }

        setTimeout(type, typeSpeed);
    }

    type();
});