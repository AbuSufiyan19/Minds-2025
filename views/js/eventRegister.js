function redirect() {
    window.location.href = "/login";
}
function logout(){
    window.location.href = "/logout";
}
function register(eName) {
    const registerButton = document.querySelector('.register h2');
    registerButton.textContent = "Registering...";
    registerButton.style.opacity = '0.7'; 
    registerButton.style.pointerEvents = 'none';

    fetch('/sessioncheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            // Redirect to login page if the response status is 401
            window.location.href = '/login';
            return; // Exit early as there is no further data to process
        } else if (response.ok) {
            // Process response if it's OK
            return response.json();
        } else {
            // Handle other non-OK responses
            return response.text().then(text => {
                showNotification(`Session check failed: ${text}`, false);
                throw new Error(text);
            });
        }
    })
    .then(data => {
        if (data) {
            fetch('/eventReg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event: eName })
            })
            .then(async response => {
                if (response.ok) {
                    return response.json(); // Parse JSON if response is OK
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Unknown error occurred');
                }
            })
            .then(data => {
                showNotification(data.message, true);
                setTimeout(() => {
                    window.location.href = '/myevent';
                }, 2000); // Redirect after 2 seconds
                registerButton.textContent = "Register Here!";
                registerButton.style.opacity = '1';  
                registerButton.style.pointerEvents = 'auto';
            })
            .catch(error => {
                // Handle network or other errors
                console.error('Error:', error);
                showNotification(error.message, false);
                registerButton.textContent = "Registered";
                registerButton.style.opacity = '1'; 
                registerButton.style.pointerEvents = 'auto';
            });
        }
    })
    .catch(error => {
        // Handle network or other errors
        console.error('Error:', error);
        showNotification('Network error. Please try again later.', false);
        registerButton.style.opacity = '1';
        registerButton.style.pointerEvents = 'auto';
    })
}

function register2(eName) {
        const registerSection = document.getElementById('registerButton');
        const registerButton = document.querySelector('.reg-buttons');
        const buttonContainer = registerSection.querySelector('#button-container');
    
        // Update the text content and disable the button
        registerButton.textContent = "Registering...";
        registerButton.style.opacity = '0.7'; 
        registerButton.style.pointerEvents = 'none';
        buttonContainer.style.pointerEvents = 'none';
    
        fetch('/sessioncheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            } else if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    showNotification(`Session check failed: ${text}`, false);
                    throw new Error(text);
                });
            }
        })
        .then(data => {
            if (data) {
                fetch('/eventReg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ event: eName })
                })
                .then(async response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        const data = await response.json();
                        throw new Error(data.message || 'Unknown error occurred');
                    }
                })
                .then(data => {
                    showNotification(data.message, true);
                    registerButton.textContent = "Team Created";  
                    setTimeout(() => {
                        window.location.href = '/myevent';
                    }, 2000);
                             
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification(error.message, false);
                    registerButton.style.opacity = '1'; 
                    registerButton.style.pointerEvents = 'auto';  
                    registerButton.textContent = "Create Team";                  
                    buttonContainer.style.pointerEvents = 'auto';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Network error. Please try again later.', false);
            registerButton.style.opacity = '1'; 
            registerButton.style.pointerEvents = 'auto';
            registerButton.textContent = "Create Team";
            buttonContainer.style.pointerEvents = 'auto';
        });
    }

    function register3(eName) {
        const registerSection = document.getElementById('registerButton');
        const registerButton = document.getElementById('lsr');
        const buttonContainer = registerSection.querySelector('#button-container');
    
        // Update the text content and disable the button
        registerButton.textContent = "Registering...";
        registerButton.style.opacity = '0.7'; 
        registerButton.style.pointerEvents = 'none';
        buttonContainer.style.pointerEvents = 'none';      
    
        fetch('/sessioncheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                // Redirect to login page if the response status is 401
                window.location.href = '/login';
                return; // Exit early as there is no further data to process
            } else if (response.ok) {
                // Process response if it's OK
                return response.json();
            } else {
                // Handle other non-OK responses
                return response.text().then(text => {
                    showNotification(`Session check failed: ${text}`, false);
                    throw new Error(text);
                });
            }
        })
        .then(data => {
            if (data) {
                fetch('/eventReg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ event: eName })
                })
                .then(async response => {
                    if (response.ok) {
                        return response.json(); // Parse JSON if response is OK
                    } else {
                        const data = await response.json();
                        throw new Error(data.message || 'Unknown error occurred');
                    }
                })
                .then(data => {
                    showNotification(data.message, true);
                    registerButton.textContent = "Team Created";                  
                    setTimeout(() => {
                        window.location.href = '/myevent';
                    }, 2000); 
                })
                .catch(error => {
                    // Handle network or other errors
                    console.error('Error:', error);
                    showNotification(error.message, false);
                    registerButton.style.opacity = '1'; 
                    registerButton.style.pointerEvents = 'auto';  
                    registerButton.textContent = "Create Team";                  
                    buttonContainer.style.pointerEvents = 'auto';
                });
            }
        })
        .catch(error => {
            // Handle network or other errors
            console.error('Error:', error);
            showNotification('Network error. Please try again later.', false);
            registerButton.style.opacity = '1'; 
            registerButton.style.pointerEvents = 'auto';  
            registerButton.textContent = "Create Team";                  
            buttonContainer.style.pointerEvents = 'auto';
        })
    }
    
    function register4(eName) {
        const registerSection = document.getElementById('registerButton');
        const registerButton = document.getElementById('lsv');
        const buttonContainer = registerSection.querySelector('#button-container');
    
        // Update the text content and disable the button
        registerButton.textContent = "Registering...";
        registerButton.style.opacity = '0.7'; 
        registerButton.style.pointerEvents = 'none';
        buttonContainer.style.pointerEvents = 'none';
    
        fetch('/sessioncheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            } else if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    showNotification(`Session check failed: ${text}`, false);
                    throw new Error(text);
                });
            }
        })
        .then(data => {
            if (data) {
                fetch('/eventReg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ event: eName })
                })
                .then(async response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        const data = await response.json();
                        throw new Error(data.message || 'Unknown error occurred');
                    }
                })
                .then(data => {
                    showNotification(data.message, true);
                    registerButton.textContent = "Team Created";  
                    setTimeout(() => {
                        window.location.href = '/myevent';
                    }, 2000);
                             
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification(error.message, false);
                    registerButton.style.opacity = '1'; 
                    registerButton.style.pointerEvents = 'auto';  
                    registerButton.textContent = "Create Team";                  
                    buttonContainer.style.pointerEvents = 'auto';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Network error. Please try again later.', false);
            registerButton.style.opacity = '1'; 
            registerButton.style.pointerEvents = 'auto';
            registerButton.textContent = "Create Team";
            buttonContainer.style.pointerEvents = 'auto';
        });
    }
    

    


document.getElementById('registerButton').addEventListener('click', function() {
    fetch('/sessioncheck', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    if (response.status === 401) {
        window.location.href = '/login';
    } else {
        return response.json();
    }
})
.then(data => {
    if (data) {
        const registerDiv = document.querySelector('.register');
        const buttonContainer = document.getElementById('button-container');
        
        // Hide the text
        registerDiv.classList.add('hide-text');
        
        // Show the buttons
        buttonContainer.classList.add('show');
    }
})
.catch((error) => {
    console.error('Error:', error);
});
});

function jointeam() {
// Redirect to the /myevents page
      window.location.href = '/myevent';
}