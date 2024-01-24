async function validate(event) {
    event.preventDefault();

    const email = document.getElementById("email");
    const emailerror = document.getElementById('emailError');
    const myForm = document.getElementById('myForm');

    if (email.value.trim() == "") {
        emailerror.textContent = "Enter Email";
        clearError(emailerror, 2000);
    } else if (/[0-9]/.test(email.value.charAt(0))) {
        emailerror.textContent = "Enter valid format";
        clearError(emailerror, 2000);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailerror.textContent = "Enter valid format";
        clearError(emailerror, 2000);
    } else {
        const response = await fetch('/forgot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email.value.trim(),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Email Sent!',
                text: data.message,
            }).then(() => {
                window.location.href = '/login';
            });
        }else {
            Swal.fire({
                icon: 'error',
                title: 'User not found',
                text: data.error || 'An error occurred.',
            });
        }
    }
}

function clearError(element, time) {
    setTimeout(() => element.textContent = "", time);
}