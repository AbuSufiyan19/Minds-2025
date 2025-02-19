var emailflag = 0;
var verifyflag = 0;
var nameflag = 0;
var rollflag = 0;
var alumnusCodeFlag = 0;
var contactflag = 0;
var genderflag = 0;
var streamflag = 0;
var foodPreferenceFlag = 0;
var accommodationFlag = 0;

// Function to validate and move to the next section
function verifyCode() {
    const code = document.getElementById('alumnusCode').value;

    return fetch('/verifycode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Code verified successfully') {
            alumnusCodeFlag = 1; // Set the flag to true when the code is valid
            hideError(document.getElementById('alumnusCode'));
            return true; // Resolve the promise with true if the code is valid
        } else {
            alumnusCodeFlag = 0; // Set the flag to false when the code is invalid
            showError(document.getElementById('alumnusCode'), 'Invalid code');
            return false; // Resolve the promise with false if the code is invalid
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alumnusCodeFlag = 0; // Set the flag to false in case of an error
        showError(document.getElementById('alumnusCode'), 'Error verifying code');
        return false; // Resolve the promise with false if there's an error
    });
}

function nextSection(current) {
    const currentSection = document.getElementById(`section${current}`);
    const nextSection = document.getElementById(`section${current + 1}`);
    
    if (validateSection(currentSection)) {
        if (emailflag != 1) {
            showNotification('OTP has not been sent',false);
            return;
        }

        if (verifyflag != 1) {
            showNotification('OTP is not verified',false);
            return;
        }

        if (current == 2 && nameflag != 1) {
            showNotification('Enter a valid Name',false);
            return;
        }
        if (current == 2) {
            validateRollNumber();
            if (rollflag != 1) {
                showNotification('Enter a valid Roll Number',false);
                return;
            }
        }
        if (current == 1) {
            verifyCode().then(isValid => {
                if (!isValid) {
                    showNotification('Enter a valid Alumnus Code',false);
                    return;
                }
                // If the code is valid, proceed to the next section
                proceedToNextSection(currentSection, nextSection, current);
            });
            return; // Ensure the function doesn't continue while waiting for verification
        }

        if (current == 2 && contactflag != 1) {
            showNotification('Enter a valid Phone Number',false);
            return;
        }
        if (current == 2 && genderflag != 1) {
            showNotification('Select a Gender',false);
            return;
        }
      
        if (current == 3 && foodPreferenceFlag != 1) {
            showNotification('Select a Food Preference',false);
            return;
        }
        if (current == 3 && accommodationFlag != 1) {
            showNotification('Select Accommodation Requirement',false);
            return;
        }

        proceedToNextSection(currentSection, nextSection, current);
    }
}


// Function to handle moving to the next section
function proceedToNextSection(currentSection, nextSection, current) {
    currentSection.classList.remove('active');
    nextSection.classList.add('active');
    updateProgressBar(current, current + 1);
}

// Function to move to the previous section
function previousSection(current) {
    const currentSection = document.getElementById(`section${current}`);
    const previousSection = document.getElementById(`section${current - 1}`);
    
    currentSection.classList.remove('active');
    previousSection.classList.add('active');

    updateProgressBar(current, current - 1);
}

// Function to update the Progress Bar
function updateProgressBar(current, next) {
    const progressBarItems = document.querySelectorAll('#progressbar li');
    
    progressBarItems.forEach(item => item.classList.remove('active', 'completed'));

    for (let i = 0; i < next; i++) {
        if (i < next - 1) {
            progressBarItems[i].classList.add('completed');
        } else {
            progressBarItems[i].classList.add('active');
        }
    }
}
// Function to validate a section (all fields within)
function validateSection(section) {
    const inputs = section.getElementsByTagName('input');
    const selects = section.getElementsByTagName('select');
    
    let isValid = true;

    // Validate input fields
    for (let input of inputs) {
        if (!input.checkValidity()) {
            showNotification(`Please fill out the ${input.name} field correctly.`,false);
            isValid = false;
            break;
        }
    }

    // Validate select fields
    if (isValid) {
        for (let select of selects) {
            if (!select.checkValidity()) {
                showNotification(`Please select a valid option for ${select.name}.`,false);
                isValid = false;
                break;
            }
        }
    }
    return isValid;
}

// Function to send verification email
function sendVerificationEmail() {
    const emailInput = document.getElementById('email');
    const sendOtpButton = emailInput.nextElementSibling;
    const emailAddress = emailInput.value;
     
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!regex.test(emailAddress)) {
        showNotification('Please enter a valid email address.', false);
        return; 
    }
    
    sendOtpButton.disabled = true;
    sendOtpButton.textContent = 'Sending...';

    fetch('/alumnisendotp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            emailAddress,
            subject: 'Your Login 2024 OTP Verification Code',
            htmlContent: `
            <p>Dear Alumni,</p>
            <p>Welcome to Login-2024</p>
            <p>To proceed, please use the following One-Time Password (OTP):</p>
            <p>Your OTP code is <strong>{{otp}}</strong></p>
            <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
            <p>If you have any queries or need assistance, please feel free to reach out to us at login@psgtech.ac.in</p>
            <p><strong>Best regards,</strong><br>
            Registration Team<br>
            Login-2024<br>
            </p>
            `  
        })
    })
    .then(async response => {
            const data = await response.json();
            if (response.status === 200) {
                emailflag = 1;
                showNotification(`OTP sent to ${emailAddress}`, true);
                sendOtpButton.textContent = 'OTP sent';
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(error.message, false);
        document.getElementById('otpError').textContent = error.message;
        sendOtpButton.textContent = 'Send OTP';
        sendOtpButton.disabled = false;
    })

}

//verify Otp
function verify(){
    email = document.getElementById('email').value;
    const otpInput = document.getElementById('otp');
    const verifyOtpButton = otpInput.nextElementSibling;
    const otp = otpInput.value;
    

    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = 'Verifying...';

    fetch('/alumniverifyotp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Verification response:', data);
        if (data.message === 'OTP verified successfully') {
            showNotification('OTP verified successfully',true);
            document.getElementById('otpError').textContent = data.message;
            verifyflag=1;
            document.getElementById('email').readOnly = true;
            document.getElementById('otp').readOnly = true;
            verifyOtpButton.textContent = 'Verified';

        } else { 
            showNotification('OTP verification failed',false);
            document.getElementById('otpError').textContent = data.message;
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = 'Verify';
        }
    })
    .catch(error => console.error('Error:', error))
  
}

function validateRollNumber() {
    const rollNumber = document.getElementById('rollNumber').value;
    const streamMap = {
        'mx': 'Computer_Application',
        'pd': 'Data_Science',
        'pt': 'Theoretical_Computer_Science',
        'pw': 'Software_Systems',
        'MX': 'Computer_Application',
        'PD': 'Data_Science',
        'PT': 'Theoretical_Computer_Science',
        'PW': 'Software_Systems',
    };

    const streamCode = rollNumber.substring(2, 4); // Extract the stream code from roll number
    const rollNumberError = document.getElementById('rollNumberError');
    
    if (streamMap[streamCode]) {
        // If the roll number code is valid
        if (rollNumberError) {
            rollNumberError.textContent = ''; // Clear any existing error message
        }
        rollflag = 1; // Set the flag to true for valid roll number
    } else {
        // If the roll number code is invalid, show an error message
        if (rollNumberError) {
            rollNumberError.textContent = 'Invalid roll number code.';
        }
        rollflag = 0; // Set the flag to false for invalid roll number
    }
}
function showError(input, message) {
    const errorSpan = input.nextElementSibling;
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

function hideError(input) {
    const errorSpan = input.nextElementSibling;
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
    }
}


// Add event listener to validate roll number on input
document.getElementById('rollNumber').addEventListener('input', validateRollNumber);
// Event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const alumnusNameInput = document.getElementById('alumnusName');
    const rollNumber = document.getElementById('rollNumber');
    const alumnusCode = document.getElementById('alumnusCode');
    const contactNumber = document.getElementById('contactNumber');
    const gender = document.getElementById('gender');
    const foodPreference = document.getElementById('foodPreference');
    const accommodationRequired = document.getElementById('accommodationRequired');

    emailInput.addEventListener('input', function() {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(this.value)) {
            showError1(this, 'Please enter a valid email address.');
        } else {
            hideError1(this);
        }
    });

    alumnusNameInput.addEventListener('input', function() {
        const regex = /^[a-zA-Z\s]+$/;
        
        if (!regex.test(this.value)) {
            showError(this, 'Please enter a valid name (letters and spaces only).');
            nameflag = 0;
        } else {
            hideError(this);
            nameflag = 1;
        }
    });

    contactNumber.addEventListener('input', function() {
        const regex = /^\d{10}$/;
        if (!regex.test(this.value)) {
            showError(this, 'Please enter a 10-digit contact number.');
            contactflag = 0;
        } else {
            hideError(this);
            contactflag = 1;
        }
    });

    gender.addEventListener('change', function() {
        if (this.value === '') {
            showError(this, 'Please select a gender.');
            genderflag = 0;
        } else {
            hideError(this);
            genderflag = 1;
        }
    });


    foodPreference.addEventListener('change', function() {
        if (this.value === '') {
            showError(this, 'Please select a food preference.');
            foodPreferenceFlag = 0;
        } else {
            hideError(this);
            foodPreferenceFlag = 1;
        }
    });

    accommodationRequired.addEventListener('change', function() {
        if (this.value === '') {
            showError(this, 'Please select accommodation requirement.');
            accommodationFlag = 0;
        } else {
            hideError(this);
            accommodationFlag = 1;
        }
    });

    rollNumber.addEventListener('input', function() {
        const regex = /^[a-zA-Z0-9]*$/;
        if (!regex.test(this.value)) {
            showError(this, 'Roll number should only contain letters and numbers.');
            rollflag = 0;
        } else {
            hideError(this);
            rollflag = 1;
        }
    });


    function showError(input, message) {
        const errorSpan = input.nextElementSibling;
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }

    function hideError(input) {
        const errorSpan = input.nextElementSibling;
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }

    function showError1(input, message) {
        const errorSpan = document.getElementById(input.id + 'Error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
    
    function hideError1(input) {
        const errorSpan = document.getElementById(input.id + 'Error');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
    }
});

// Function to handle form submission
function submitForm() {
    // Get the form element
    if (validateSection(document.getElementById('section3'))) {

    const form = document.getElementById('registrationForm');
    const button = document.getElementById('submit');
    button.textContent='Registering...'
    button.disabled = true;
    // Create FormData object from the form
    const formData = new FormData(form);
    
    // Convert FormData to JSON object
    const formObject = {};
    formData.forEach((value, key) => { formObject[key] = value });
    
    // Send the form data using fetch
    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
    })
    .then(response => response.json())
    .then(data => {
        // Check the response message and redirect accordingly
        if (data.message === 'User registered successfully' || data.message === 'User details updated successfully') {
            showNotification('Registration Successful',true);
            button.textContent='Registered'
            window.location.href = data.redirect; // Redirect to the specified URL
        } else {
            showNotification(data.message,false);
            button.textContent='Register'
            button.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while processing the registration.',false);
        button.textContent='Register'
        button.disabled = false;

    });
}
}


//notification function
function showNotification(message, isSuccess) {
    const notificationDiv = document.getElementById('notification');
    const messageP = document.getElementById('message');

    messageP.textContent = message;

    if (isSuccess) {
 
        notificationDiv.classList.add('alert-success');
        notificationDiv.classList.remove('alert-error');
    } else {

        notificationDiv.classList.add('alert-error');
        notificationDiv.classList.remove('alert-success');
    }

    notificationDiv.style.display = 'flex';

    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Close notification when '×' is clicked
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});