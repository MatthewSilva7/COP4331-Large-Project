// A simple function to test the Unit
const validateCourse = (subject, number) => {

    // Logic: Subject must be 3 letters, Number must be 4 digits
    return subject.length === 3 && number.length === 4;
};

describe('Unit Testing: Course Validation', () => {
    test('should return true for valid input (COP 4331)', () => {
        expect(validateCourse("COP", "4331")).toBe(true);
    });

    test('should return false for invalid subject (CO 4331)', () => { 
        expect(validateCourse("CO", "4331")).toBe(false);
    });

    test('should return false for invalid number (COP 433)', () => {
        expect(validateCourse("COP", "433")).toBe(false);
    });

    test('Assignment Fault: should handle empty inputs gracefully', () => {
        expect(validateCourse("", "")).toBe(false);
    });
});
