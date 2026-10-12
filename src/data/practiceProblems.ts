import { PracticeProblem } from '../types';

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: 'p_1',
    title: 'Top Earning Faculty Members',
    description: 'Find all instructors whose annual salary is strictly greater than $110,000. Display their name, department ID, and salary ordered from highest to lowest salary.',
    difficulty: 'Easy',
    topic: 'WHERE',
    databaseId: 'university_db',
    estimatedMinutes: 5,
    xpReward: 15,
    initialSql: `-- Write a query to find instructors earning > $110,000
SELECT 
    name, 
    dept_id, 
    salary 
FROM instructors
-- Add your WHERE condition and sorting here
;`,
    expectedQuery: 'SELECT name, dept_id, salary FROM instructors WHERE salary > 110000 ORDER BY salary DESC;',
    hints: [
      'Look at the `instructors` table and its `salary` column.',
      'Use the comparison operator `salary > 110000` in your WHERE clause.',
      'Add `ORDER BY salary DESC` to arrange the results from highest to lowest compensation.',
    ],
    solution: 'SELECT name, dept_id, salary FROM instructors WHERE salary > 110000 ORDER BY salary DESC;',
    explanation: 'The WHERE clause filters for salaries > 110,000, and ORDER BY salary DESC sorts the highest earners first.',
    testCases: [
      {
        id: 'tc_1',
        description: 'Verify instructors earning > $110,000 sorted descending',
        expectedQuery: 'SELECT name, dept_id, salary FROM instructors WHERE salary > 110000 ORDER BY salary DESC;',
      },
    ],
    tags: ['SELECT', 'WHERE', 'ORDER BY', 'Instructors'],
  },
  {
    id: 'p_2',
    title: 'Honor Students in Computer Science',
    description: 'Retrieve the student ID, name, email, and GPA of all students majoring in Computer Science (dept_id = 1) who have a GPA of 3.50 or higher.',
    difficulty: 'Easy',
    topic: 'WHERE',
    databaseId: 'university_db',
    estimatedMinutes: 5,
    xpReward: 15,
    initialSql: `-- Retrieve CS students with GPA >= 3.50
SELECT 
    student_id,
    name,
    email,
    gpa
FROM students
WHERE dept_id = 1
-- Complete the condition
;`,
    expectedQuery: 'SELECT student_id, name, email, gpa FROM students WHERE dept_id = 1 AND gpa >= 3.50;',
    hints: [
      'Combine two conditions using the `AND` logical operator.',
      'Check both `dept_id = 1` and `gpa >= 3.50`.',
      'Select student_id, name, email, and gpa columns.',
    ],
    solution: 'SELECT student_id, name, email, gpa FROM students WHERE dept_id = 1 AND gpa >= 3.50;',
    explanation: 'Combines multiple criteria using `AND` to ensure both department and GPA thresholds are satisfied.',
    testCases: [
      {
        id: 'tc_2',
        description: 'Verify CS honor students with GPA >= 3.50',
        expectedQuery: 'SELECT student_id, name, email, gpa FROM students WHERE dept_id = 1 AND gpa >= 3.50;',
      },
    ],
    tags: ['SELECT', 'WHERE', 'AND', 'Students'],
  },
  {
    id: 'p_3',
    title: 'Total Budget by Department Building',
    description: 'Calculate the total budget allocated across departments located in each building. Display the building name and the summed budget as `total_building_budget`. Order by total budget descending.',
    difficulty: 'Medium',
    topic: 'GROUP BY',
    databaseId: 'university_db',
    estimatedMinutes: 8,
    xpReward: 25,
    initialSql: `-- Group departments by building and sum their budgets
SELECT 
    building,
    SUM(budget) AS total_building_budget
FROM departments
-- Group and sort here
;`,
    expectedQuery: 'SELECT building, SUM(budget) AS total_building_budget FROM departments GROUP BY building ORDER BY total_building_budget DESC;',
    hints: [
      'Group the rows by the `building` column.',
      'Use the `SUM(budget)` aggregate function and alias it with `AS total_building_budget`.',
      'Sort using `ORDER BY total_building_budget DESC`.',
    ],
    solution: 'SELECT building, SUM(budget) AS total_building_budget FROM departments GROUP BY building ORDER BY total_building_budget DESC;',
    explanation: 'Uses GROUP BY on building along with SUM(budget) to compute aggregate investment per physical location.',
    testCases: [
      {
        id: 'tc_3',
        description: 'Verify grouped building budgets',
        expectedQuery: 'SELECT building, SUM(budget) AS total_building_budget FROM departments GROUP BY building ORDER BY total_building_budget DESC;',
      },
    ],
    tags: ['GROUP BY', 'SUM', 'Aggregates'],
  },
  {
    id: 'p_4',
    title: 'Course Catalog with Department Details',
    description: 'Write an INNER JOIN query that retrieves each course title, credit hours, department name, and campus building.',
    difficulty: 'Medium',
    topic: 'JOIN',
    databaseId: 'university_db',
    estimatedMinutes: 8,
    xpReward: 25,
    initialSql: `-- Join courses and departments
SELECT 
    c.title,
    c.credits,
    d.dept_name,
    d.building
FROM courses c
-- Add INNER JOIN condition on dept_id
;`,
    expectedQuery: 'SELECT c.title, c.credits, d.dept_name, d.building FROM courses c INNER JOIN departments d ON c.dept_id = d.dept_id ORDER BY c.title;',
    hints: [
      'Join `courses c` with `departments d` on `c.dept_id = d.dept_id`.',
      'Project `c.title, c.credits, d.dept_name, d.building`.',
      'Order by `c.title` ascending for consistent ordering.',
    ],
    solution: 'SELECT c.title, c.credits, d.dept_name, d.building FROM courses c INNER JOIN departments d ON c.dept_id = d.dept_id ORDER BY c.title;',
    explanation: 'Connects courses to their academic department using the foreign key dept_id.',
    testCases: [
      {
        id: 'tc_4',
        description: 'Verify course and department join',
        expectedQuery: 'SELECT c.title, c.credits, d.dept_name, d.building FROM courses c INNER JOIN departments d ON c.dept_id = d.dept_id ORDER BY c.title;',
      },
    ],
    tags: ['JOIN', 'INNER JOIN', 'Departments'],
  },
  {
    id: 'p_5',
    title: 'Departments with Multiple Courses',
    description: 'Find all department names that offer 2 or more courses in the catalog. Display the department name and the total number of courses offered as `course_count`.',
    difficulty: 'Medium',
    topic: 'HAVING',
    databaseId: 'university_db',
    estimatedMinutes: 10,
    xpReward: 30,
    initialSql: `-- Find departments offering >= 2 courses
SELECT 
    d.dept_name,
    COUNT(c.course_id) AS course_count
FROM departments d
JOIN courses c ON d.dept_id = c.dept_id
-- Add GROUP BY and HAVING
;`,
    expectedQuery: 'SELECT d.dept_name, COUNT(c.course_id) AS course_count FROM departments d JOIN courses c ON d.dept_id = c.dept_id GROUP BY d.dept_name HAVING COUNT(c.course_id) >= 2;',
    hints: [
      'Join departments and courses on `dept_id`.',
      'Group by `d.dept_name`.',
      'Filter aggregate groups with `HAVING COUNT(c.course_id) >= 2`.',
    ],
    solution: 'SELECT d.dept_name, COUNT(c.course_id) AS course_count FROM departments d JOIN courses c ON d.dept_id = c.dept_id GROUP BY d.dept_name HAVING COUNT(c.course_id) >= 2;',
    explanation: 'Combines JOIN, GROUP BY, and HAVING to isolate high-volume course departments.',
    testCases: [
      {
        id: 'tc_5',
        description: 'Verify departments offering >= 2 courses',
        expectedQuery: 'SELECT d.dept_name, COUNT(c.course_id) AS course_count FROM departments d JOIN courses c ON d.dept_id = c.dept_id GROUP BY d.dept_name HAVING COUNT(c.course_id) >= 2;',
      },
    ],
    tags: ['HAVING', 'GROUP BY', 'JOIN', 'COUNT'],
  },
  {
    id: 'p_6',
    title: 'Instructors Earning More Than Average',
    description: 'Write a subquery to return all instructors earning strictly more than the average faculty salary across the entire university. Display their name, salary, and how much higher they earn compared to average (as `above_avg_diff` rounded to 2 decimals).',
    difficulty: 'Medium',
    topic: 'Subquery',
    databaseId: 'university_db',
    estimatedMinutes: 10,
    xpReward: 35,
    initialSql: `-- Find instructors earning above average
SELECT 
    name,
    salary,
    ROUND(salary - (SELECT AVG(salary) FROM instructors), 2) AS above_avg_diff
FROM instructors
-- Add subquery filter
WHERE salary > (SELECT AVG(salary) FROM instructors)
ORDER BY salary DESC;`,
    expectedQuery: 'SELECT name, salary, ROUND(salary - (SELECT AVG(salary) FROM instructors), 2) AS above_avg_diff FROM instructors WHERE salary > (SELECT AVG(salary) FROM instructors) ORDER BY salary DESC;',
    hints: [
      'Use a scalar subquery `(SELECT AVG(salary) FROM instructors)` in your WHERE clause.',
      'Compute the difference `salary - (SELECT AVG(salary) FROM instructors)` in the SELECT list.',
      'Order by salary descending.',
    ],
    solution: 'SELECT name, salary, ROUND(salary - (SELECT AVG(salary) FROM instructors), 2) AS above_avg_diff FROM instructors WHERE salary > (SELECT AVG(salary) FROM instructors) ORDER BY salary DESC;',
    explanation: 'Scalar subqueries evaluate dynamically to compare individual records against population statistics.',
    testCases: [
      {
        id: 'tc_6',
        description: 'Verify faculty earning above university average',
        expectedQuery: 'SELECT name, salary, ROUND(salary - (SELECT AVG(salary) FROM instructors), 2) AS above_avg_diff FROM instructors WHERE salary > (SELECT AVG(salary) FROM instructors) ORDER BY salary DESC;',
      },
    ],
    tags: ['Subquery', 'Scalar Subquery', 'AVG', 'Salary'],
  },
  {
    id: 'p_7',
    title: 'Department Salary Ranking with Window Functions',
    description: 'Rank instructors by salary overall using the `DENSE_RANK()` window function. Display the instructor name, department ID, salary, and their assigned `salary_rank`.',
    difficulty: 'Hard',
    topic: 'Window Functions',
    databaseId: 'university_db',
    estimatedMinutes: 12,
    xpReward: 45,
    initialSql: `-- Use DENSE_RANK() OVER (ORDER BY ...)
SELECT 
    name,
    dept_id,
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
FROM instructors
ORDER BY salary_rank;`,
    expectedQuery: 'SELECT name, dept_id, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM instructors ORDER BY salary_rank;',
    hints: [
      'Window functions use the `OVER()` clause.',
      'Use `DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank`.',
      'Order the final output by `salary_rank`.',
    ],
    solution: 'SELECT name, dept_id, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM instructors ORDER BY salary_rank;',
    explanation: 'DENSE_RANK() computes non-gapped ranks for ordered numeric salary distributions.',
    testCases: [
      {
        id: 'tc_7',
        description: 'Verify dense rank window calculation',
        expectedQuery: 'SELECT name, dept_id, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank FROM instructors ORDER BY salary_rank;',
      },
    ],
    tags: ['Window Functions', 'DENSE_RANK', 'OVER'],
  },
  {
    id: 'p_8',
    title: 'Modular High-Value Product Analysis with CTE',
    description: 'Using a Common Table Expression (CTE) named `ExpensiveProducts`, find all products in the E-Commerce catalog with price >= $100. Then join with categories to display the product name, category name, price, and stock quantity.',
    difficulty: 'Hard',
    topic: 'CTE',
    databaseId: 'ecommerce_db',
    estimatedMinutes: 12,
    xpReward: 45,
    initialSql: `-- Define CTE ExpensiveProducts
WITH ExpensiveProducts AS (
    SELECT * FROM products WHERE price >= 100
)
SELECT 
    p.product_name,
    c.category_name,
    p.price,
    p.stock_quantity
FROM ExpensiveProducts p
JOIN categories c ON p.category_id = c.category_id
ORDER BY p.price DESC;`,
    expectedQuery: 'WITH ExpensiveProducts AS (SELECT * FROM products WHERE price >= 100) SELECT p.product_name, c.category_name, p.price, p.stock_quantity FROM ExpensiveProducts p JOIN categories c ON p.category_id = c.category_id ORDER BY p.price DESC;',
    hints: [
      'Start with `WITH ExpensiveProducts AS (SELECT * FROM products WHERE price >= 100)`.',
      'Join `ExpensiveProducts p` with `categories c` on `p.category_id = c.category_id`.',
      'Order by `p.price DESC`.',
    ],
    solution: 'WITH ExpensiveProducts AS (SELECT * FROM products WHERE price >= 100) SELECT p.product_name, c.category_name, p.price, p.stock_quantity FROM ExpensiveProducts p JOIN categories c ON p.category_id = c.category_id ORDER BY p.price DESC;',
    explanation: 'Common Table Expressions modularize intermediate filtering steps for cleaner analytics.',
    testCases: [
      {
        id: 'tc_8',
        description: 'Verify CTE expensive product breakdown',
        expectedQuery: 'WITH ExpensiveProducts AS (SELECT * FROM products WHERE price >= 100) SELECT p.product_name, c.category_name, p.price, p.stock_quantity FROM ExpensiveProducts p JOIN categories c ON p.category_id = c.category_id ORDER BY p.price DESC;',
      },
    ],
    tags: ['CTE', 'WITH', 'E-Commerce', 'JOIN'],
  },
  {
    id: 'p_9',
    title: 'Customer Lifetime Spend Aggregator',
    description: 'Calculate the total lifetime expenditure for each customer in the E-Commerce database. Display customer ID, first name, last name, total orders count (as `total_orders`), and summed spend (as `total_spent`). Only include customers who have placed at least 1 order. Order by total spent descending.',
    difficulty: 'Medium',
    topic: 'JOIN',
    databaseId: 'ecommerce_db',
    estimatedMinutes: 10,
    xpReward: 30,
    initialSql: `-- Customer total spend aggregator
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;`,
    expectedQuery: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS total_orders, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY total_spent DESC;',
    hints: [
      'Join `customers c` and `orders o` on `c.customer_id = o.customer_id`.',
      'Group by customer identity attributes.',
      'Sum `o.total_amount` and count `o.order_id`.',
    ],
    solution: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS total_orders, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY total_spent DESC;',
    explanation: 'Aggregates multiple orders per customer to calculate gross revenue contributions.',
    testCases: [
      {
        id: 'tc_9',
        description: 'Verify customer order count and sum',
        expectedQuery: 'SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) AS total_orders, SUM(o.total_amount) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY total_spent DESC;',
      },
    ],
    tags: ['JOIN', 'GROUP BY', 'SUM', 'COUNT', 'E-Commerce'],
  },
  {
    id: 'p_10',
    title: 'Detect Inactive / Zero Order Customers',
    description: 'Find all registered customers who have never placed an order in the e-commerce system. Display their customer ID, full name (first_name || " " || last_name as `full_name`), and email address.',
    difficulty: 'Medium',
    topic: 'JOIN',
    databaseId: 'ecommerce_db',
    estimatedMinutes: 8,
    xpReward: 25,
    initialSql: `-- Find customers without any orders using LEFT JOIN
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.email
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;`,
    expectedQuery: "SELECT c.customer_id, c.first_name || ' ' || c.last_name AS full_name, c.email FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;",
    hints: [
      'Use a `LEFT JOIN` between customers and orders.',
      'Check `WHERE o.order_id IS NULL` to filter for unmatched rows.',
      'Concatenate first and last name with `|| " " ||`.',
    ],
    solution: "SELECT c.customer_id, c.first_name || ' ' || c.last_name AS full_name, c.email FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;",
    explanation: 'LEFT JOIN with a NULL check on the right relation identifies anti-join / orphan entities.',
    testCases: [
      {
        id: 'tc_10',
        description: 'Verify inactive zero-order customers',
        expectedQuery: "SELECT c.customer_id, c.first_name || ' ' || c.last_name AS full_name, c.email FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL;",
      },
    ],
    tags: ['LEFT JOIN', 'NULL', 'Anti-Join'],
  },
];
