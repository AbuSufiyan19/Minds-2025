//notification function
function showNotification(message, isSuccess) {
    const notificationDiv = document.getElementById('notification');
    const messageP = document.getElementById('message');
    

    // Set the message
    messageP.textContent = message;

    // Change the icon and color based on success or failure
    if (isSuccess) {
        
        notificationDiv.classList.add('alert-success');
        notificationDiv.classList.remove('alert-error');
    } else {
        
        notificationDiv.classList.add('alert-error');
        notificationDiv.classList.remove('alert-success');
    }

    // Show the notification
    notificationDiv.style.display = 'flex';

    // Optional: Hide the notification after a certain time (e.g., 5 seconds)
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Close notification when '×' is clicked
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});