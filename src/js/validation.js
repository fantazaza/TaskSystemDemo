export function validateTask(task) {
    const errors = [];
    
    if (!task.title || task.title.trim().length === 0) {
        errors.push("Title is required.");
    }
    
    if (task.price !== undefined && task.price !== null && task.price !== '') {
        const priceNum = parseFloat(task.price);
        if (isNaN(priceNum) || priceNum < 0) {
            errors.push("Price must be a valid non-negative number.");
        }
    }
    
    if (task.deadline) {
        const dateObj = new Date(task.deadline);
        if (isNaN(dateObj.getTime())) {
            errors.push("Invalid deadline date.");
        }
    }
    
    return errors;
}

export function showErrorNotification(message) {
    alert(`Error: ${message}`);
}
