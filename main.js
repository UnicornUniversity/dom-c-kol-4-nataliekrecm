/**
 * @file Employee Generator and Statistics Calculator
 */

// --- Constants ---
const WORKLOADS = [10, 20, 30, 40];
const GENDERS = ["male", "female"];

const MALE_NAMES = ["Jan", "Petr", "Pavel", "Jiří", "Martin", "Tomáš", "Jaroslav", "Miroslav", "Zdeněk", "Václav", "David", "Jakub", "Lukáš", "Michal", "František", "Karel", "Milan", "Josef", "Andrej", "Jindřich", "Ondřej", "Marek", "Roman", "Filip", "Antonín"];
const FEMALE_NAMES = ["Jana", "Marie", "Eva", "Hana", "Anna", "Lenka", "Kateřina", "Věra", "Lucie", "Alena", "Petra", "Veronika", "Martina", "Jitka", "Tereza", "Michaela", "Zuzana", "Monika", "Magdaléna", "Elena", "Kristýna", "Markéta", "Barbora", "Nikola", "Karolína"];
const MALE_SURNAMES = ["Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec", "Marek", "Pospíšil", "Pokorný", "Hájek", "Král", "Jelínek", "Růžička", "Záruba", "Drapák", "Beneš", "Fiala", "Sedláček", "Doležal", "Zeman", "Kolář"];
const FEMALE_SURNAMES = ["Nováková", "Svobodová", "Novotná", "Dvořáková", "Černá", "Procházková", "Kučerová", "Veselá", "Horáková", "Němcová", "Marková", "Pospíšilová", "Pokorná", "Hájková", "Králová", "Jelínková", "Růžičková", "Zárubová", "Drapáková", "Benešová", "Fialová", "Sedláčková", "Doležalová", "Zemanová", "Kolářová"];

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// --- Helper functions ---

/**
 * Helper to pick random item from array.
 * @param {Array} array Source array
 * @returns {*} Random element
 */
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gets random name and surname based on gender.
 * @param {string} gender male/female
 * @returns {object} { name, surname }
 */
function generateName(gender) {
    if (gender === "male") {
        return { name: getRandomItem(MALE_NAMES), surname: getRandomItem(MALE_SURNAMES) };
    }
    return { name: getRandomItem(FEMALE_NAMES), surname: getRandomItem(FEMALE_SURNAMES) };
}

/**
 * Generates random birthdate string in ISO format.
 * @param {number} minAge Minimum age
 * @param {number} maxAge Maximum age
 * @returns {string} ISO Date-Time string
 */
function generateBirthdate(minAge, maxAge) {
    const now = Date.now();
    const minTimestamp = now - (maxAge * MS_PER_YEAR);
    const maxTimestamp = now - (minAge * MS_PER_YEAR);
    const randomTimestamp = Math.random() * (maxTimestamp - minTimestamp) + minTimestamp;
    return new Date(randomTimestamp).toISOString();
}

/**
 * Calculates median value from an array of numbers.
 * @param {Array<number>} values Array of numbers
 * @returns {number} Median value
 */
function getMedian(values) {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    if (values.length % 2 !== 0) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) / 2.0;
    }
}

/**
 * Calculates current exact age (float) from birthdate.
 * @param {string} birthdateISO ISO date string
 * @returns {number} Age as float
 */
function getAge(birthdateISO) {
    const birthDate = new Date(birthdateISO).getTime();
    const now = Date.now();
    return (now - birthDate) / MS_PER_YEAR;
}

/**
 * Helper function to calculate final rounded values (moved here to reduce lines in main function).
 * @param {object} rawStats Object with raw sums and arrays
 * @param {number} total Total count
 * @returns {object} Final rounded stats
 */
function finalizeStatistics(rawStats, total) {
    const result = {};
    result.averageAge = Math.round((rawStats.sumAge / total) * 10) / 10;
    result.minAge = Math.floor(rawStats.minAgeFloat);
    result.maxAge = Math.floor(rawStats.maxAgeFloat);
    result.medianAge = Math.floor(getMedian(rawStats.exactAges));
    result.medianWorkload = getMedian(rawStats.workloads);
    
    result.averageWomenWorkload = 0;
    if (rawStats.womenCount > 0) {
        result.averageWomenWorkload = Math.round((rawStats.sumWomenWorkload / rawStats.womenCount) * 10) / 10;
    }
    return result;
}

// --- Main exported functions ---

/**
 * The main function which calls the application. 
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {object} containing the statistics
 */
export function main(dtoIn) {
    if (!dtoIn || typeof dtoIn.count !== 'number' || !dtoIn.age) {
        throw new Error("Invalid input");
    }
    const employees = generateEmployeeData(dtoIn);
    return getEmployeeStatistics(employees);
}

/**
 * Main loop to generate the list of employees.
 * @param {object} dtoIn contains count of employees, age limit of employees {min, max}
 * @returns {Array} of employees
 */
export function generateEmployeeData(dtoIn) {
    const employees = [];
    for (let i = 0; i < dtoIn.count; i++) {
        const gender = getRandomItem(GENDERS);
        const workload = getRandomItem(WORKLOADS);
        const nameData = generateName(gender);
        const birthdate = generateBirthdate(dtoIn.age.min, dtoIn.age.max);

        employees.push({
            gender: gender,
            birthdate: birthdate,
            name: nameData.name,
            surname: nameData.surname,
            workload: workload
        });
    }
    return employees;
}

/**
 * Calculates statistics from employee list.
 * @param {Array} employees containing all the mocked employee data
 * @returns {object} statistics of the employees
 */
export function getEmployeeStatistics(employees) {
    const res = { total: employees.length, workload10: 0, workload20: 0, workload30: 0, workload40: 0, sortedByWorkload: [] };
    if (employees.length === 0) return { ...res, minAge: 0, maxAge: 0, averageAge: 0, medianAge: 0, medianWorkload: 0, averageWomenWorkload: 0 };

    const raw = { exactAges: [], workloads: [], sumAge: 0, sumWomenWorkload: 0, womenCount: 0, minAgeFloat: Number.MAX_VALUE, maxAgeFloat: Number.MIN_VALUE };

    employees.forEach(emp => {
        if (emp.workload === 10) res.workload10++;
        else if (emp.workload === 20) res.workload20++;
        else if (emp.workload === 30) res.workload30++;
        else res.workload40++;

        const age = getAge(emp.birthdate);
        raw.exactAges.push(age);
        raw.sumAge += age;
        if (age < raw.minAgeFloat) raw.minAgeFloat = age;
        if (age > raw.maxAgeFloat) raw.maxAgeFloat = age;

        raw.workloads.push(emp.workload);
        if (emp.gender === "female") { raw.sumWomenWorkload += emp.workload; raw.womenCount++; }
    });

    const finalStats = finalizeStatistics(raw, employees.length);
    res.sortedByWorkload = [...employees].sort((a, b) => a.workload - b.workload);
    
    return { ...res, ...finalStats };
}