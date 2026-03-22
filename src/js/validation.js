export function validateTask(task) {
    const errors = [];
    
    if (!task.title || task.title.trim().length === 0) {
        errors.push("Title is required.");
    } else if (task.title.length > 100) {
        errors.push("Title must be under 100 characters.");
    }

    if (task.description && task.description.length > 500) {
        errors.push("Description must be under 500 characters.");
    }

    const price = parseFloat(task.price);
    if (isNaN(price) || price < 0) {
        errors.push("Price must be a valid non-negative number.");
    } else if (price > 1000000) {
        errors.push("Price seems unusually high. Please verify.");
    }

    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (isNaN(deadlineDate.getTime())) {
            errors.push("Invalid deadline date format.");
        }
    }

    return errors;
}

export function showErrorNotification(message) {
    alert(`Error: ${message}`);
}
