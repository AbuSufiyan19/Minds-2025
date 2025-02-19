document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('email').addEventListener('input', validateEmail);
    document.getElementById('newPassword').addEventListener('input', validatePassword);
    document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);
});

function validateEmail() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        return false;
    } else {
        emailError.textContent = '';
        return true;
    }
}



function sendOtp() {
    const emailInput = document.getElementById('email');
    const sendOtpButton = emailInput.nextElementSibling;
    const email = emailInput.value;

    if (validateEmail()) {
        sendOtpButton.disabled = true;
        sendOtpButton.textContent = 'Sending...';

        fetch('/send-otp-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                subject: 'Password Reset Request for Login 2024',
                htmlContent: `<p>Dear {{User}},</p>
                <p>To proceed with the password reset, please use the following One-Time Password (OTP):</p>
                <p>Your OTP code is <strong>{{otp}}</strong></p>
                <p>If you did not request a password reset, please ignore this email or contact our support team for assistance at login@psgtech.ac.in.</p>
                <p><strong>Best regards,</strong><br>
                Registration Team<br>
                Login-2024<br>
                </p>
                <hr>
                <div style="width: 100%; text-align: center;">
                    <img src="https://i.imgur.com/JQIgh6Y.png" alt="Login - 2024" style="width: 200px;">
                    <p><strong>Hey, do you follow us on social media?</strong></p>
                    <a href="https://www.instagram.com/loginpsgtech/"><img src="https://cdn-icons-png.flaticon.com/128/174/174855.png" alt="Instagram" style="width: 40px;"></a>
                    &nbsp;&nbsp;
                    <a href="https://www.linkedin.com/company/login-psg-tech/"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linked In" style="width: 40px;"></a>
                    <p>Follow us to get the latest updates on events, announcements, and more.</p>
                </div>
                <hr>`
            })
        })
        .then(async response => {
            const data = await response.json();
            if (response.status === 200) {
                emailflag = 1;
                sendOtpButton.textContent = 'OTP Sent';
                showNotification(`OTP sent to ${email}`, true);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            showNotification(error.message, false);
            showError(emailInput, error.message);
            window.location.reload();
            sendOtpButton.disabled = false;
            sendOtpButton.textContent = 'Send OTP';
            document.getElementById('otpError').textContent = error.message;
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            
        })
    } else {
        showNotification('Invalid Email', false);
        sendOtpButton.disabled = false;
        sendOtpButton.textContent = 'Send OTP';
    }
}

function verifyOtp(){
    email = document.getElementById('email').value;
    const otpInput = document.getElementById('otp');
    const verifyOtpButton = otpInput.nextElementSibling;
    const otp = otpInput.value;
    console.log('Verifying OTP for:', email, otp);
    
    verifyOtpButton.disabled = true;
    verifyOtpButton.textContent = 'Verifying...';

    
    console.log('Verifying OTP for:', email, otp);
    
    fetch('/verify-otp', {
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
            verifyOtpButton.textContent = 'Verifed';
            document.getElementById('emailMobileSection').style.display = 'none';
            document.getElementById('passwordSection').style.display = 'block';

        } else {
            showNotification(data.message,false);
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = 'Verify';
            document.getElementById('otpError').textContent = data.message;
        }
    })
    .catch(error => console.error('Error:', error));
}

function togglePasswordVisibility() {
    const password = document.getElementById('newPassword');
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



function validatePassword() {
    const newPassword = document.getElementById('newPassword').value;
    const passwordError = document.getElementById('passwordError');

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

    if (!passwordPattern.test(newPassword)) {
        passwordError.textContent = 'Password must be 8 to 15 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character.';
        return false;
    } else {
        passwordError.textContent = '';
        return true;
    }
}


function validateConfirmPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match.';
        return false;
    } else {
        confirmPasswordError.textContent = '';
        return true;
    }
}


function resetPassword(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;

    if (validatePassword() && validateConfirmPassword()) {


    fetch('/rspassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Password changed successfully!', true);
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showNotification('Error changing password', false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error changing password', false);
    });
    } else {
            showNotification('Password Mismatch Error.',false);
    }
}

