// --- DOM Elements ---
const header = document.getElementById('header');
const mobileToggle = document.getElementById('mobile-toggle');
const navLinks = document.getElementById('nav-links');
const jobsContainer = document.getElementById('jobs-container');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const modal = document.getElementById('job-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-job-title');
const modalLocation = document.getElementById('modal-job-location');
const modalDesc = document.getElementById('modal-job-desc');
const applicationForm = document.getElementById('application-form');

// Donation Modal Elements
const donateModal = document.getElementById('donate-modal');
const donateModalClose = document.getElementById('donate-modal-close');
const donationForm = document.getElementById('donation-form');
const presetBtns = document.querySelectorAll('.preset-btn');
const donorAmountInput = document.getElementById('donorAmount');

// Toast Elements
const toast = document.getElementById('success-toast');
const toastCloseBtn = document.getElementById('toast-close-btn');

// --- State ---
let selectedJob = null;
const jobs = [
    {
        id: 1,
        title: "Executive Assistant",
        category: "admin",
        location: "Abuja, Nigeria",
        tag: "Full-Time",
        description: "Administrative & Office role. High demand in banks, NGOs, schools, hospitals, and companies."
    },
    {
        id: 2,
        title: "HR Officer",
        category: "hr",
        location: "Lagos, Nigeria",
        tag: "Full-Time",
        description: "Human Resources & Recruitment. Women often excel in communication and people management roles."
    },
    {
        id: 3,
        title: "Registered Nurse",
        category: "healthcare",
        location: "United Kingdom (Sponsored)",
        tag: "Contract",
        description: "Health & Care Services. Healthcare remains one of the fastest-growing sectors for women globally and in Africa."
    },
    {
        id: 4,
        title: "School Administrator",
        category: "education",
        location: "Accra, Ghana",
        tag: "Full-Time",
        description: "Education & Childcare. Highly needed in Nigeria, Ghana, Kenya, South Africa, and abroad."
    },
    {
        id: 5,
        title: "Virtual Assistant",
        category: "remote",
        location: "Remote",
        tag: "Contract",
        description: "Remote & Digital. Remote staffing from Africa is growing rapidly, especially for women."
    },
    {
        id: 6,
        title: "Program Officer",
        category: "ngo",
        location: "Nairobi, Kenya",
        tag: "Full-Time",
        description: "NGO & Development Sector. Organizations like UN Women regularly recruit women across Africa."
    },
    {
        id: 7,
        title: "Hotel Front Desk Officer",
        category: "hospitality",
        location: "Cape Town, South Africa",
        tag: "Full-Time",
        description: "Hospitality & Aviation. These sectors value presentation, communication, and customer relations."
    },
    {
        id: 8,
        title: "Farm Supervisor",
        category: "agriculture",
        location: "Kano, Nigeria",
        tag: "Full-Time",
        description: "Agriculture & Food Processing. Women in mechanized agriculture are increasingly supported across Africa."
    },
    {
        id: 9,
        title: "Spa Therapist",
        category: "beauty",
        location: "Lagos, Nigeria",
        tag: "Contract",
        description: "Beauty, Fashion & Wellness. High demand for skilled professionals."
    },
    {
        id: 10,
        title: "ICT Support",
        category: "skilled",
        location: "Remote",
        tag: "Full-Time",
        description: "Skilled & Technical Roles. Tech and digital talent from Africa is in high demand."
    }
];

// --- Sticky Header & Scroll ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.padding = '0';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.padding = '0.5rem 0';
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    }
});

// --- Mobile Navigation ---
mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// --- Render Jobs ---
function renderJobs(filterCategory = 'all') {
    jobsContainer.innerHTML = '';
    
    const filteredJobs = filterCategory === 'all' 
        ? jobs 
        : jobs.filter(job => job.category === filterCategory);
        
    if (filteredJobs.length === 0) {
        jobsContainer.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">No opportunities found in this category.</p>';
        return;
    }

    filteredJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.innerHTML = `
            <div class="job-meta">
                <span class="job-tag">${job.tag}</span>
                <span class="job-location"><i data-lucide="map-pin"></i> ${job.location}</span>
            </div>
            <h3 class="job-title">${job.title}</h3>
            <p class="job-desc">${job.description.substring(0, 100)}...</p>
            <button class="apply-btn" onclick="openModal(${job.id})">Apply Now</button>
        `;
        jobsContainer.appendChild(jobCard);
    });

    // Re-initialize icons for newly added elements
    lucide.createIcons();
}

// --- Filtering Logic ---
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        e.target.classList.add('active');
        
        const filter = e.target.getAttribute('data-filter');
        renderJobs(filter);
    });
});

// --- Modal Logic ---
window.openModal = function(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    selectedJob = job;
    modalTitle.textContent = job.title;
    modalLocation.textContent = job.location;
    modalDesc.textContent = job.description;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
};

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    applicationForm.reset();
    selectedJob = null;
}

modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// --- Toast Logic ---
function showToast(title, desc) {
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-desc').textContent = desc;
    toast.classList.add('show');
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    toast.classList.remove('show');
}

toastCloseBtn.addEventListener('click', hideToast);

// --- Form Submission ---
applicationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const whyFit = document.getElementById('whyFit').value.trim();
    
    if (!selectedJob) return;

    const payload = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        fullName,
        email,
        phone,
        whyFit
    };

    const submitBtn = applicationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    fetch('/api/apply', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            closeModal();
            showToast('Application Submitted!', 'Thank you for applying. A representative from the Woman Africa International Foundation will contact you soon.');
        } else {
            alert(data.message || 'An error occurred. Please try again.');
        }
    })
    .catch(err => {
        console.error('Error submitting application:', err);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Could not submit application. Please check your connection and try again.');
    });
});

// --- Donation Modal Logic ---
window.openDonateModal = function() {
    donateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeDonateModal = function() {
    donateModal.classList.remove('active');
    document.body.style.overflow = '';
    donationForm.reset();
    presetBtns.forEach(btn => btn.classList.remove('active'));
};

donateModalClose.addEventListener('click', closeDonateModal);
donateModal.addEventListener('click', (e) => {
    if (e.target === donateModal) {
        closeDonateModal();
    }
});

// Preset Buttons Selection
presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        presetBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        donorAmountInput.value = e.target.getAttribute('data-amount');
    });
});

// Reset presets if amount input changes
donorAmountInput.addEventListener('input', () => {
    const val = donorAmountInput.value;
    presetBtns.forEach(btn => {
        if (btn.getAttribute('data-amount') === val) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

// Donation Form Submission with Paystack Checkout
donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const donorName = document.getElementById('donorName').value.trim();
    const donorEmail = document.getElementById('donorEmail').value.trim();
    const amount = parseFloat(donorAmountInput.value);

    if (!donorName || !donorEmail || isNaN(amount) || amount < 500) {
        alert('Please fill out all fields. Minimum donation is ₦500.');
        return;
    }

    const submitBtn = donationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Initializing...';
    submitBtn.disabled = true;

    // Fetch config for Paystack public key
    fetch('/api/config')
        .then(res => res.json())
        .then(config => {
            if (!config.paystackPublicKey) {
                throw new Error('Paystack public key is not configured.');
            }
            
            const handler = PaystackPop.setup({
                key: config.paystackPublicKey,
                email: donorEmail,
                amount: amount * 100, // in kobo
                currency: 'NGN',
                ref: 'WA-DON-' + Math.floor((Math.random() * 1000000000) + 1),
                callback: function(response) {
                    submitBtn.textContent = 'Recording...';
                    
                    const payload = {
                        fullName: donorName,
                        email: donorEmail,
                        amount: amount,
                        reference: response.reference,
                        status: 'Success'
                    };
                    
                    fetch('/api/donations', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(res => res.json())
                    .then(data => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        if (data.success) {
                            closeDonateModal();
                            showToast('Donation Successful!', 'Thank you for your generous support! Your contribution makes a direct difference in restoring dignity to African women.');
                        } else {
                            alert(data.message || 'Donation was successful, but we failed to record it locally.');
                        }
                    })
                    .catch(err => {
                        console.error('Error logging donation:', err);
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        alert('Donation was successful, but we could not connect to record it.');
                    });
                },
                onClose: function() {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    alert('Donation transaction cancelled.');
                }
            });
            
            handler.openIframe();
        })
        .catch(err => {
            console.error('Error initializing Paystack:', err);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('Could not initialize payment gateway. Please verify server configuration.');
        });
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderJobs();
    
    // Intercept all donate link clicks to open modal
    document.querySelectorAll('a[href="#donate"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            openDonateModal();
        });
    });
    
    // Set variable for header padding transition
    header.style.transition = 'padding 0.3s ease, box-shadow 0.3s ease';
});
