// register.js
var emailflag=0;
var verifyflag=0;
var passflag=0;
var nameflag=0;
var rollflag=0;
var conpassflag=0;
var contactflag=0;
var genderflag=0;

// Function to validate and move to the next section
function nextSection(current) {
    const currentSection = document.getElementById(`section${current}`);
    const nextSection = document.getElementById(`section${current + 1}`);
    
    if (validateSection(currentSection)) {
        if (current==1 && emailflag != 1) {
            showNotification('Enter Valid Official Email Address',false);
            return;
        }

        // if (verifyflag != 1) {
        //     showNotification('OTP is not verified',false);
        //     return;
        // }
        if(current==1 && passflag != 1){
            showNotification('Enter a valid Password',false);
            return;
        }
        if(current==1 && conpassflag != 1){
            showNotification('Password do not Match',false);
            return;
        }
    
        if(current==2 && nameflag != 1){
            showNotification('Enter a valid Name',false);
            return;
        }
        if(current==2 && rollflag != 1){
            showNotification('Enter a valid Roll Number',false);
            return;
        }
        if(current==2 && contactflag != 1){
            showNotification('Enter a valid Phone Number',false);
            return;
        }
        
        currentSection.classList.remove('active');
        nextSection.classList.add('active');

        updateProgressBar(current, current + 1);
    }
}

function togglePasswordVisibility() {
    const password = document.getElementById('password');
    const toggle1 = document.getElementById('toggle1');
    const toggle2 = document.getElementById('toggle2');

    if (password.type === 'password') {
        password.type = 'text';
        toggle1.style.display = 'none';
        toggle2.style.display = 'inline';
    } else {
        password.type = 'password';
        toggle1.style.display = 'inline';
        toggle2.style.display = 'none'; 
    }
}

function validatePassword(password) {
    const minLength = 8;
    const maxLength = 15;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialCharacters = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialCharacters && password.length <=maxLength) {
        return true;
    } else {
        return false;
    }
}


function previousSection(current) {
    const currentSection = document.getElementById(`section${current}`);
    const previousSection = document.getElementById(`section${current - 1}`);
    
    currentSection.classList.remove('active');
    previousSection.classList.add('active');

    updateProgressBar(current, current - 1);
}


function validateSection(section) {
    const inputs = section.getElementsByTagName('input');
    const selects = section.getElementsByTagName('select');
    
    let isValid = true;

    for (let input of inputs) {
        if (!input.checkValidity()) {
            showNotification(`Please fill out the ${input.name} field correctly.`,false);
            isValid = false;
            break;
        }
    }

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



// function sendVerificationEmail() {
//     const emailInput = document.getElementById('email');
//     const sendOtpButton = emailInput.nextElementSibling;
//     const email = emailInput.value;
     
//     const regex = /^2[34]mx(1[0-2][0-9]|130|2[0-2][0-9]|230|3[0-2][0-9]|330|4[0-2][0-9]|430)@psgtech\.ac\.in$/;


//     if (!regex.test(email)) {
//         showNotification('Please enter a valid email address.', false);
//         showError(emailInput, 'Please enter a valid email address.');
//         return; 
//     }
    
//     sendOtpButton.disabled = true;
//     sendOtpButton.textContent = 'Sending...';

//     fetch('/send-otp', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ 
//             email,
//             subject: 'Your Minds 2025 OTP Verification Code',
//             htmlContent: `
//             <p>Dear Participant,</p>
//             <p>Welcome to Minds-2025</p>
//             <p>To proceed, please use the following One-Time Password (OTP):</p>
//             <p>Your OTP code is <strong>{{otp}}</strong></p>
//             <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
//             <p>If you have any queries or need assistance, please feel free to reach out to us at minds@psgtech.ac.in</p>
//             <p><strong>Best regards,</strong><br>
//             Registration Team<br>
//             Minds-2025<br>
//             </p>
//             `  
//         })
//     })
//     .then(async response => {
//         const data = await response.json();
//         if (response.status === 200) {
//             emailflag = 1;
//             sendOtpButton.textContent = 'OTP Sent';
//             showNotification(`OTP sent to ${email}`, true)
//         } else {
//             throw new Error(data.message || 'Unknown error occurred');
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         sendOtpButton.disabled = false;
//         sendOtpButton.textContent = 'Send OTP';
//         showNotification(error.message, false);
//         showError(emailInput, error.message);
//         document.getElementById('otpError').textContent = error.message;
//     })
       
// }

//verify Otp
// function verify(){
//     email = document.getElementById('email').value;
//     const otpInput = document.getElementById('otp');
//     const verifyOtpButton = otpInput.nextElementSibling;
//     const otp = otpInput.value;

//     verifyOtpButton.disabled = true;
//     verifyOtpButton.textContent = 'Verifying...';

//     fetch('/verify-otp', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, otp })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Verification response:', data);
//         if (data.message === 'OTP verified successfully') {
//             showNotification('OTP verified successfully',true);
//             document.getElementById('otpError').textContent = data.message;
//             verifyflag=1;
//             verifyOtpButton.textContent = 'Verified';
//             document.getElementById('email').readOnly = true;
//             document.getElementById('otp').readOnly = true;

//         } else { 
//             showNotification('OTP verification failed',false);
//             document.getElementById('otpError').textContent = data.message;
//             verifyOtpButton.disabled = false;
//             verifyOtpButton.textContent = 'Verify';
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         showNotification('An error occurred. Please try again.', false);
//         verifyOtpButton.disabled = false;
//         verifyOtpButton.textContent = 'Verify';
//     });
// }

document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const otp = document.getElementById('otp');
    const studentNameInput = document.getElementById('studentName');
    const rollNumber = document.getElementById('rollNumber');
    const gender = document.getElementById('gender');
    const contactNumber = document.getElementById('contactNumber');

    emailInput.addEventListener('input', function() {
        const regex = /^2[34]mx(1[0-2][0-9]|130|2[0-2][0-9]|230|3[0-5][0-9]|360)@psgtech\.ac\.in$/;
        if (!regex.test(this.value)) {
            showError1(this, 'Please enter your official email address.');
            emailflag = 0;
        } else {
            hideError1(this);
            emailflag = 1;
        }
    });

    studentNameInput.addEventListener('input', function() {
        const regex = /^[a-zA-Z\s]+$/;
        
        if (!regex.test(this.value)) {
            showError(this, 'Please enter a Valid name (letters and spaces only).');
            nameflag=0;
        } else {
            hideError(this);
            nameflag=1;
        }
    });
    contactNumber.addEventListener('input', function() {
        const regex = /^\d{10}$/;
        const regex2 = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        const isInvalidSequence =/^987654\d{4}$/;
        // Remove any leading '+91', '0', or '+91-' from the input to focus on the last 10 digits
        const strippedNumber = this.value.replace(/^(\+91[\-\s]?|0)/, '');
             if (!regex2.test(this.value) || isInvalidSequence.test(strippedNumber)) {
            showError(this, 'Please enter a valid phone number.');
            contactflag=0;
        } else {
            hideError(this);
            contactflag=1;
        }
    });
    gender.addEventListener('change', function() {
        if (this.value === '') {
            showError(this, 'Please select a gender.');
            genderflag=0;
        } else {
            hideError(this);
            genderflag=1;
        }
    });
    
    rollNumber.addEventListener('input', function() {
        const regex = /^2[34][mM][xX](1[0-2][0-9]|130|2[0-2][0-9]|230|3[0-5][0-9]|360)$/;
        if (!regex.test(this.value)) {
            showError(this, 'Roll number should only contain letters and numbers.');
            rollflag=0;
        } else {
            hideError(this);
            rollflag=1;
        }
    });
        

    passwordInput.addEventListener('input', function() {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
        
        if (!regex.test(this.value)) {
            showError1(this, 'Password must be 8 to 15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
            passflag=0;
        } else {
            hideError1  (this);
            passflag=1;
        }
    });
    

    confirmPasswordInput.addEventListener('input', function() {
        validateConfirmPassword();
    });

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showError(confirmPasswordInput, 'Passwords do not match.');
            conpassflag=0;
        } else {
            hideError(confirmPasswordInput);
            conpassflag=1;
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
    

    document.getElementById('registrationForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const registerButton = event.target.querySelector('button[type="submit"]');

        
        if (validateSection(document.getElementById('section2'))) {
            const formData = new FormData(event.target);
            const formObject = Object.fromEntries(formData.entries());

            registerButton.disabled = true;
            registerButton.textContent = 'Registering...';
            
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formObject)
            })
            .then(response => response.json())
            .then(data => {
                showNotification(data.message,true);
                registerButton.textContent = 'Registered';

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to register. Please try again later.',false);
                registerButton.textContent = 'Register';
                registerButton.disabled = false;
            });
        }
    });
});

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