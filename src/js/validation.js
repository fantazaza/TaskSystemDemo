export function validateTask(task) {
    const errors = [];
    
    if (!task.title || task.title.trim().length === 0) {
        errors.push("Task title is required.");
    } else if (task.title.length > 100) {
        errors.push("Task title must be under 100 characters.");
    }

    if (task.description && task.description.length > 500) {
        errors.push("Description must be under 500 characters.");
    }

    const price = parseFloat(task.price);
    if (isNaN(price) || price < 0) {
        errors.push("Budget must be a non-negative number.");
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (isNaN(deadlineDate.getTime())) {
            errors.push("Invalid deadline date format.");
        }
    }

    if (!['todo', 'inprogress', 'done'].includes(task.status)) {
        errors.push("Status must be: todo, inprogress, or done.");
    }

    return errors;
}

export function showErrorNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${message}</span>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}
