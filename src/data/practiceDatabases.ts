import { DatabaseSchema } from '../types';

export const PRACTICE_DATABASES: DatabaseSchema[] = [
  {
    id: 'university_db',
    name: 'University & College Database',
    category: 'Education',
    description: 'Relational data modeling students, departments, courses, instructors, and enrollments.',
    tables: [
      {
        name: 'departments',
        description: 'Academic departments in the university.',
        columns: [
          { name: 'dept_id', type: 'INTEGER', primaryKey: true, description: 'Unique department ID' },
          { name: 'dept_name', type: 'TEXT', nullable: false, description: 'Name of the department' },
          { name: 'building', type: 'TEXT', description: 'Campus building name' },
          { name: 'budget', type: 'NUMERIC', description: 'Annual department budget in USD' },
        ],
        sampleRows: [
          { dept_id: 1, dept_name: 'Computer Science', building: 'Turing Hall', budget: 1500000 },
          { dept_id: 2, dept_name: 'Electrical Engineering', building: 'Tesla Lab', budget: 1200000 },
          { dept_id: 3, dept_name: 'Mathematics', building: 'Euler Tower', budget: 800000 },
          { dept_id: 4, dept_name: 'Business Administration', building: 'Smith Complex', budget: 1100000 },
          { dept_id: 5, dept_name: 'Physics', building: 'Newton Hall', budget: 950000 },
        ],
      },
      {
        name: 'instructors',
        description: 'Faculty professors and lecturers.',
        columns: [
          { name: 'instructor_id', type: 'INTEGER', primaryKey: true, description: 'Unique faculty ID' },
          { name: 'name', type: 'TEXT', nullable: false, description: 'Instructor full name' },
          { name: 'dept_id', type: 'INTEGER', foreignKey: { table: 'departments', column: 'dept_id' }, description: 'Department reference' },
          { name: 'salary', type: 'NUMERIC', description: 'Annual salary in USD' },
          { name: 'hire_date', type: 'TEXT', description: 'Date of joining (YYYY-MM-DD)' },
        ],
        sampleRows: [
          { instructor_id: 101, name: 'Dr. Alan Turing', dept_id: 1, salary: 115000, hire_date: '2016-08-15' },
          { instructor_id: 102, name: 'Dr. Grace Hopper', dept_id: 1, salary: 125000, hire_date: '2014-01-10' },
          { instructor_id: 103, name: 'Dr. Nikola Tesla', dept_id: 2, salary: 108000, hire_date: '2018-09-01' },
          { instructor_id: 104, name: 'Dr. Carl Gauss', dept_id: 3, salary: 98000, hire_date: '2015-06-20' },
          { instructor_id: 105, name: 'Dr. Marie Curie', dept_id: 5, salary: 130000, hire_date: '2012-11-05' },
          { instructor_id: 106, name: 'Prof. Adam Smith', dept_id: 4, salary: 92000, hire_date: '2020-02-15' },
        ],
      },
      {
        name: 'courses',
        description: 'Catalog of academic courses offered.',
        columns: [
          { name: 'course_id', type: 'TEXT', primaryKey: true, description: 'Unique course code' },
          { name: 'title', type: 'TEXT', nullable: false, description: 'Course title' },
          { name: 'dept_id', type: 'INTEGER', foreignKey: { table: 'departments', column: 'dept_id' }, description: 'Offering department' },
          { name: 'credits', type: 'INTEGER', description: 'Credit hours' },
          { name: 'instructor_id', type: 'INTEGER', foreignKey: { table: 'instructors', column: 'instructor_id' }, description: 'Primary instructor' },
        ],
        sampleRows: [
          { course_id: 'CS101', title: 'Intro to Database Systems', dept_id: 1, credits: 4, instructor_id: 101 },
          { course_id: 'CS201', title: 'Data Structures & Algorithms', dept_id: 1, credits: 4, instructor_id: 102 },
          { course_id: 'EE101', title: 'Circuit Analysis', dept_id: 2, credits: 3, instructor_id: 103 },
          { course_id: 'MATH201', title: 'Linear Algebra', dept_id: 3, credits: 3, instructor_id: 104 },
          { course_id: 'BUS301', title: 'Financial Management', dept_id: 4, credits: 3, instructor_id: 106 },
          { course_id: 'PHYS101', title: 'Quantum Mechanics I', dept_id: 5, credits: 4, instructor_id: 105 },
        ],
      },
      {
        name: 'students',
        description: 'Enrolled university students.',
        columns: [
          { name: 'student_id', type: 'INTEGER', primaryKey: true, description: 'Unique student identification' },
          { name: 'name', type: 'TEXT', nullable: false, description: 'Student full name' },
          { name: 'email', type: 'TEXT', nullable: false, description: 'Student academic email' },
          { name: 'dept_id', type: 'INTEGER', foreignKey: { table: 'departments', column: 'dept_id' }, description: 'Major department' },
          { name: 'tot_cred', type: 'INTEGER', description: 'Total earned credits' },
          { name: 'gpa', type: 'NUMERIC', description: 'Current GPA (0.00 - 4.00)' },
        ],
        sampleRows: [
          { student_id: 1001, name: 'Alice Walker', email: 'alice@univ.edu', dept_id: 1, tot_cred: 72, gpa: 3.85 },
          { student_id: 1002, name: 'Bob Chen', email: 'bob@univ.edu', dept_id: 1, tot_cred: 48, gpa: 3.42 },
          { student_id: 1003, name: 'Catherine Diaz', email: 'catherine@univ.edu', dept_id: 2, tot_cred: 90, gpa: 3.91 },
          { student_id: 1004, name: 'David Kumar', email: 'david@univ.edu', dept_id: 3, tot_cred: 32, gpa: 2.95 },
          { student_id: 1005, name: 'Emma Watson', email: 'emma@univ.edu', dept_id: 4, tot_cred: 104, gpa: 3.78 },
          { student_id: 1006, name: 'Frank Miller', email: 'frank@univ.edu', dept_id: 1, tot_cred: 18, gpa: 3.10 },
          { student_id: 1007, name: 'Grace Hopper Jr.', email: 'ghopper@univ.edu', dept_id: 5, tot_cred: 60, gpa: 3.95 },
        ],
      },
      {
        name: 'enrollments',
        description: 'Student course registrations and grades.',
        columns: [
          { name: 'enrollment_id', type: 'INTEGER', primaryKey: true, description: 'Unique enrollment ID' },
          { name: 'student_id', type: 'INTEGER', foreignKey: { table: 'students', column: 'student_id' } },
          { name: 'course_id', type: 'TEXT', foreignKey: { table: 'courses', column: 'course_id' } },
          { name: 'semester', type: 'TEXT', description: 'Semester e.g., Fall 2025' },
          { name: 'grade', type: 'TEXT', description: 'Letter grade (A, B, C, D, F, or NULL if in progress)' },
        ],
        sampleRows: [
          { enrollment_id: 501, student_id: 1001, course_id: 'CS101', semester: 'Fall 2025', grade: 'A' },
          { enrollment_id: 502, student_id: 1001, course_id: 'MATH201', semester: 'Fall 2025', grade: 'A' },
          { enrollment_id: 503, student_id: 1002, course_id: 'CS101', semester: 'Fall 2025', grade: 'B' },
          { enrollment_id: 504, student_id: 1003, course_id: 'EE101', semester: 'Fall 2025', grade: 'A' },
          { enrollment_id: 505, student_id: 1004, course_id: 'MATH201', semester: 'Fall 2025', grade: 'C' },
          { enrollment_id: 506, student_id: 1005, course_id: 'BUS301', semester: 'Fall 2025', grade: 'A' },
          { enrollment_id: 507, student_id: 1006, course_id: 'CS101', semester: 'Spring 2026', grade: null },
          { enrollment_id: 508, student_id: 1007, course_id: 'PHYS101', semester: 'Fall 2025', grade: 'A' },
        ],
      },
    ],
    initSql: `
      DROP TABLE IF EXISTS enrollments;
      DROP TABLE IF EXISTS courses;
      DROP TABLE IF EXISTS students;
      DROP TABLE IF EXISTS instructors;
      DROP TABLE IF EXISTS departments;

      CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL,
        building TEXT,
        budget NUMERIC
      );

      CREATE TABLE instructors (
        instructor_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dept_id INTEGER,
        salary NUMERIC,
        hire_date TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
      );

      CREATE TABLE courses (
        course_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        dept_id INTEGER,
        credits INTEGER,
        instructor_id INTEGER,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
        FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id)
      );

      CREATE TABLE students (
        student_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        dept_id INTEGER,
        tot_cred INTEGER,
        gpa NUMERIC,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
      );

      CREATE TABLE enrollments (
        enrollment_id INTEGER PRIMARY KEY,
        student_id INTEGER,
        course_id TEXT,
        semester TEXT,
        grade TEXT,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (course_id) REFERENCES courses(course_id)
      );

      INSERT INTO departments VALUES
        (1, 'Computer Science', 'Turing Hall', 1500000),
        (2, 'Electrical Engineering', 'Tesla Lab', 1200000),
        (3, 'Mathematics', 'Euler Tower', 800000),
        (4, 'Business Administration', 'Smith Complex', 1100000),
        (5, 'Physics', 'Newton Hall', 950000);

      INSERT INTO instructors VALUES
        (101, 'Dr. Alan Turing', 1, 115000, '2016-08-15'),
        (102, 'Dr. Grace Hopper', 1, 125000, '2014-01-10'),
        (103, 'Dr. Nikola Tesla', 2, 108000, '2018-09-01'),
        (104, 'Dr. Carl Gauss', 3, 98000, '2015-06-20'),
        (105, 'Dr. Marie Curie', 5, 130000, '2012-11-05'),
        (106, 'Prof. Adam Smith', 4, 92000, '2020-02-15');

      INSERT INTO courses VALUES
        ('CS101', 'Intro to Database Systems', 1, 4, 101),
        ('CS201', 'Data Structures & Algorithms', 1, 4, 102),
        ('EE101', 'Circuit Analysis', 2, 3, 103),
        ('MATH201', 'Linear Algebra', 3, 3, 104),
        ('BUS301', 'Financial Management', 4, 3, 106),
        ('PHYS101', 'Quantum Mechanics I', 5, 4, 105);

      INSERT INTO students VALUES
        (1001, 'Alice Walker', 'alice@univ.edu', 1, 72, 3.85),
        (1002, 'Bob Chen', 'bob@univ.edu', 1, 48, 3.42),
        (1003, 'Catherine Diaz', 'catherine@univ.edu', 2, 90, 3.91),
        (1004, 'David Kumar', 'david@univ.edu', 3, 32, 2.95),
        (1005, 'Emma Watson', 'emma@univ.edu', 4, 104, 3.78),
        (1006, 'Frank Miller', 'frank@univ.edu', 1, 18, 3.10),
        (1007, 'Grace Hopper Jr.', 'ghopper@univ.edu', 5, 60, 3.95);

      INSERT INTO enrollments VALUES
        (501, 1001, 'CS101', 'Fall 2025', 'A'),
        (502, 1001, 'MATH201', 'Fall 2025', 'A'),
        (503, 1002, 'CS101', 'Fall 2025', 'B'),
        (504, 1003, 'EE101', 'Fall 2025', 'A'),
        (505, 1004, 'MATH201', 'Fall 2025', 'C'),
        (506, 1005, 'BUS301', 'Fall 2025', 'A'),
        (507, 1006, 'CS101', 'Spring 2026', NULL),
        (508, 1007, 'PHYS101', 'Fall 2025', 'A');
    `,
  },
  {
    id: 'ecommerce_db',
    name: 'E-Commerce & Retail Database',
    category: 'Retail & Commerce',
    description: 'Customers, products, categories, orders, order items, and user reviews.',
    tables: [
      {
        name: 'categories',
        description: 'Product merchandise categories.',
        columns: [
          { name: 'category_id', type: 'INTEGER', primaryKey: true },
          { name: 'category_name', type: 'TEXT', nullable: false },
        ],
        sampleRows: [
          { category_id: 1, category_name: 'Electronics' },
          { category_id: 2, category_name: 'Computers & Accessories' },
          { category_id: 3, category_name: 'Home & Kitchen' },
          { category_id: 4, category_name: 'Books' },
        ],
      },
      {
        name: 'products',
        description: 'Inventory items available for purchase.',
        columns: [
          { name: 'product_id', type: 'INTEGER', primaryKey: true },
          { name: 'product_name', type: 'TEXT', nullable: false },
          { name: 'category_id', type: 'INTEGER', foreignKey: { table: 'categories', column: 'category_id' } },
          { name: 'price', type: 'NUMERIC', nullable: false },
          { name: 'stock_quantity', type: 'INTEGER', nullable: false },
        ],
        sampleRows: [
          { product_id: 201, product_name: 'Wireless Noise-Canceling Headphones', category_id: 1, price: 199.99, stock_quantity: 45 },
          { product_id: 202, product_name: '4K Ultra HD Smart Monitor 27"', category_id: 2, price: 349.50, stock_quantity: 20 },
          { product_id: 203, product_name: 'Mechanical Ergonomic Keyboard', category_id: 2, price: 129.00, stock_quantity: 80 },
          { product_id: 204, product_name: 'Stainless Steel Pour-Over Coffee Maker', category_id: 3, price: 49.99, stock_quantity: 110 },
          { product_id: 205, product_name: 'Database Internals Handbook', category_id: 4, price: 54.95, stock_quantity: 60 },
          { product_id: 206, product_name: 'USB-C Dual Fast Charger 65W', category_id: 1, price: 29.99, stock_quantity: 150 },
        ],
      },
      {
        name: 'customers',
        description: 'Registered e-commerce buyers.',
        columns: [
          { name: 'customer_id', type: 'INTEGER', primaryKey: true },
          { name: 'first_name', type: 'TEXT', nullable: false },
          { name: 'last_name', type: 'TEXT', nullable: false },
          { name: 'email', type: 'TEXT', nullable: false },
          { name: 'city', type: 'TEXT' },
          { name: 'country', type: 'TEXT' },
        ],
        sampleRows: [
          { customer_id: 1, first_name: 'Sophia', last_name: 'Reyes', email: 'sophia@email.com', city: 'San Francisco', country: 'USA' },
          { customer_id: 2, first_name: 'Liam', last_name: 'Smith', email: 'liam@email.com', city: 'London', country: 'UK' },
          { customer_id: 3, first_name: 'Aarav', last_name: 'Patel', email: 'aarav@email.com', city: 'Mumbai', country: 'India' },
          { customer_id: 4, first_name: 'Elena', last_name: 'Rostova', email: 'elena@email.com', city: 'Berlin', country: 'Germany' },
          { customer_id: 5, first_name: 'Lucas', last_name: 'Silva', email: 'lucas@email.com', city: 'Toronto', country: 'Canada' },
        ],
      },
      {
        name: 'orders',
        description: 'Customer purchase checkout orders.',
        columns: [
          { name: 'order_id', type: 'INTEGER', primaryKey: true },
          { name: 'customer_id', type: 'INTEGER', foreignKey: { table: 'customers', column: 'customer_id' } },
          { name: 'order_date', type: 'TEXT', nullable: false },
          { name: 'status', type: 'TEXT', description: 'Pending, Shipped, Delivered, Cancelled' },
          { name: 'total_amount', type: 'NUMERIC' },
        ],
        sampleRows: [
          { order_id: 1001, customer_id: 1, order_date: '2025-01-15', status: 'Delivered', total_amount: 328.99 },
          { order_id: 1002, customer_id: 2, order_date: '2025-01-18', status: 'Delivered', total_amount: 349.50 },
          { order_id: 1003, customer_id: 3, order_date: '2025-02-01', status: 'Shipped', total_amount: 183.95 },
          { order_id: 1004, customer_id: 1, order_date: '2025-02-10', status: 'Delivered', total_amount: 49.99 },
          { order_id: 1005, customer_id: 4, order_date: '2025-02-14', status: 'Cancelled', total_amount: 199.99 },
          { order_id: 1006, customer_id: 5, order_date: '2025-02-20', status: 'Delivered', total_amount: 158.99 },
        ],
      },
      {
        name: 'order_items',
        description: 'Line item breakdown for each order.',
        columns: [
          { name: 'item_id', type: 'INTEGER', primaryKey: true },
          { name: 'order_id', type: 'INTEGER', foreignKey: { table: 'orders', column: 'order_id' } },
          { name: 'product_id', type: 'INTEGER', foreignKey: { table: 'products', column: 'product_id' } },
          { name: 'quantity', type: 'INTEGER', nullable: false },
          { name: 'unit_price', type: 'NUMERIC', nullable: false },
        ],
        sampleRows: [
          { item_id: 1, order_id: 1001, product_id: 201, quantity: 1, unit_price: 199.99 },
          { item_id: 2, order_id: 1001, product_id: 203, quantity: 1, unit_price: 129.00 },
          { item_id: 3, order_id: 1002, product_id: 202, quantity: 1, unit_price: 349.50 },
          { item_id: 4, order_id: 1003, product_id: 203, quantity: 1, unit_price: 129.00 },
          { item_id: 5, order_id: 1003, product_id: 205, quantity: 1, unit_price: 54.95 },
          { item_id: 6, order_id: 1004, product_id: 204, quantity: 1, unit_price: 49.99 },
          { item_id: 7, order_id: 1005, product_id: 201, quantity: 1, unit_price: 199.99 },
          { item_id: 8, order_id: 1006, product_id: 203, quantity: 1, unit_price: 129.00 },
          { item_id: 9, order_id: 1006, product_id: 206, quantity: 1, unit_price: 29.99 },
        ],
      },
    ],
    initSql: `
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS customers;

      CREATE TABLE categories (
        category_id INTEGER PRIMARY KEY,
        category_name TEXT NOT NULL
      );

      CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        category_id INTEGER,
        price NUMERIC NOT NULL,
        stock_quantity INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
      );

      CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        city TEXT,
        country TEXT
      );

      CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT NOT NULL,
        status TEXT,
        total_amount NUMERIC,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      );

      CREATE TABLE order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        unit_price NUMERIC NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      );

      INSERT INTO categories VALUES
        (1, 'Electronics'),
        (2, 'Computers & Accessories'),
        (3, 'Home & Kitchen'),
        (4, 'Books');

      INSERT INTO products VALUES
        (201, 'Wireless Noise-Canceling Headphones', 1, 199.99, 45),
        (202, '4K Ultra HD Smart Monitor 27"', 2, 349.50, 20),
        (203, 'Mechanical Ergonomic Keyboard', 2, 129.00, 80),
        (204, 'Stainless Steel Pour-Over Coffee Maker', 3, 49.99, 110),
        (205, 'Database Internals Handbook', 4, 54.95, 60),
        (206, 'USB-C Dual Fast Charger 65W', 1, 29.99, 150);

      INSERT INTO customers VALUES
        (1, 'Sophia', 'Reyes', 'sophia@email.com', 'San Francisco', 'USA'),
        (2, 'Liam', 'Smith', 'liam@email.com', 'London', 'UK'),
        (3, 'Aarav', 'Patel', 'aarav@email.com', 'Mumbai', 'India'),
        (4, 'Elena', 'Rostova', 'elena@email.com', 'Berlin', 'Germany'),
        (5, 'Lucas', 'Silva', 'lucas@email.com', 'Toronto', 'Canada');

      INSERT INTO orders VALUES
        (1001, 1, '2025-01-15', 'Delivered', 328.99),
        (1002, 2, '2025-01-18', 'Delivered', 349.50),
        (1003, 3, '2025-02-01', 'Shipped', 183.95),
        (1004, 1, '2025-02-10', 'Delivered', 49.99),
        (1005, 4, '2025-02-14', 'Cancelled', 199.99),
        (1006, 5, '2025-02-20', 'Delivered', 158.99);

      INSERT INTO order_items VALUES
        (1, 1001, 201, 1, 199.99),
        (2, 1001, 203, 1, 129.00),
        (3, 1002, 202, 1, 349.50),
        (4, 1003, 203, 1, 129.00),
        (5, 1003, 205, 1, 54.95),
        (6, 1004, 204, 1, 49.99),
        (7, 1005, 201, 1, 199.99),
        (8, 1006, 203, 1, 129.00),
        (9, 1006, 206, 1, 29.99);
    `,
  },
  {
    id: 'hr_db',
    name: 'Tech Enterprise HR Database',
    category: 'Human Resources',
    description: 'Corporate organizational structure, departments, employee compensations, and engineering projects.',
    tables: [
      {
        name: 'departments',
        description: 'Corporate department divisions.',
        columns: [
          { name: 'dept_id', type: 'INTEGER', primaryKey: true },
          { name: 'dept_name', type: 'TEXT', nullable: false },
          { name: 'location', type: 'TEXT' },
        ],
        sampleRows: [
          { dept_id: 10, dept_name: 'Engineering', location: 'San Jose' },
          { dept_id: 20, dept_name: 'Product Management', location: 'New York' },
          { dept_id: 30, dept_name: 'Data Science & AI', location: 'Seattle' },
          { dept_id: 40, dept_name: 'Marketing', location: 'Austin' },
          { dept_id: 50, dept_name: 'Finance', location: 'Chicago' },
        ],
      },
      {
        name: 'employees',
        description: 'Staff members, managers, roles, and salaries.',
        columns: [
          { name: 'emp_id', type: 'INTEGER', primaryKey: true },
          { name: 'first_name', type: 'TEXT', nullable: false },
          { name: 'last_name', type: 'TEXT', nullable: false },
          { name: 'job_title', type: 'TEXT', nullable: false },
          { name: 'dept_id', type: 'INTEGER', foreignKey: { table: 'departments', column: 'dept_id' } },
          { name: 'manager_id', type: 'INTEGER', foreignKey: { table: 'employees', column: 'emp_id' } },
          { name: 'salary', type: 'NUMERIC', nullable: false },
          { name: 'hire_date', type: 'TEXT' },
        ],
        sampleRows: [
          { emp_id: 1, first_name: 'Sarah', last_name: 'Connor', job_title: 'VP Engineering', dept_id: 10, manager_id: null, salary: 220000, hire_date: '2018-03-01' },
          { emp_id: 2, first_name: 'Michael', last_name: 'Scott', job_title: 'Staff Architect', dept_id: 10, manager_id: 1, salary: 175000, hire_date: '2019-07-15' },
          { emp_id: 3, first_name: 'Priya', last_name: 'Sharma', job_title: 'Senior Backend Engineer', dept_id: 10, manager_id: 2, salary: 145000, hire_date: '2021-01-10' },
          { emp_id: 4, first_name: 'Alex', last_name: 'Rivera', job_title: 'Lead AI Scientist', dept_id: 30, manager_id: 1, salary: 185000, hire_date: '2020-05-12' },
          { emp_id: 5, first_name: 'Jessica', last_name: 'Pearson', job_title: 'Director of Product', dept_id: 20, manager_id: null, salary: 195000, hire_date: '2019-02-20' },
          { emp_id: 6, first_name: 'Daniel', last_name: 'Kim', job_title: 'Product Designer', dept_id: 20, manager_id: 5, salary: 110000, hire_date: '2022-04-01' },
          { emp_id: 7, first_name: 'Rachel', last_name: 'Green', job_title: 'Marketing Specialist', dept_id: 40, manager_id: null, salary: 85000, hire_date: '2023-01-15' },
        ],
      },
      {
        name: 'projects',
        description: 'Strategic technical initiatives.',
        columns: [
          { name: 'project_id', type: 'INTEGER', primaryKey: true },
          { name: 'project_name', type: 'TEXT', nullable: false },
          { name: 'dept_id', type: 'INTEGER', foreignKey: { table: 'departments', column: 'dept_id' } },
          { name: 'budget', type: 'NUMERIC' },
          { name: 'status', type: 'TEXT' },
        ],
        sampleRows: [
          { project_id: 101, project_name: 'Cloud Data Lake Migration', dept_id: 10, budget: 500000, status: 'In Progress' },
          { project_id: 102, project_name: 'Generative AI Assistant', dept_id: 30, budget: 850000, status: 'Active' },
          { project_id: 103, project_name: 'Mobile App V2 Redesign', dept_id: 20, budget: 320000, status: 'Completed' },
          { project_id: 104, project_name: 'Security & Compliance 2026', dept_id: 10, budget: 250000, status: 'Planning' },
        ],
      },
    ],
    initSql: `
      DROP TABLE IF EXISTS projects;
      DROP TABLE IF EXISTS employees;
      DROP TABLE IF EXISTS departments;

      CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL,
        location TEXT
      );

      CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        job_title TEXT NOT NULL,
        dept_id INTEGER,
        manager_id INTEGER,
        salary NUMERIC NOT NULL,
        hire_date TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
        FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
      );

      CREATE TABLE projects (
        project_id INTEGER PRIMARY KEY,
        project_name TEXT NOT NULL,
        dept_id INTEGER,
        budget NUMERIC,
        status TEXT,
        FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
      );

      INSERT INTO departments VALUES
        (10, 'Engineering', 'San Jose'),
        (20, 'Product Management', 'New York'),
        (30, 'Data Science & AI', 'Seattle'),
        (40, 'Marketing', 'Austin'),
        (50, 'Finance', 'Chicago');

      INSERT INTO employees VALUES
        (1, 'Sarah', 'Connor', 'VP Engineering', 10, NULL, 220000, '2018-03-01'),
        (2, 'Michael', 'Scott', 'Staff Architect', 10, 1, 175000, '2019-07-15'),
        (3, 'Priya', 'Sharma', 'Senior Backend Engineer', 10, 2, 145000, '2021-01-10'),
        (4, 'Alex', 'Rivera', 'Lead AI Scientist', 30, 1, 185000, '2020-05-12'),
        (5, 'Jessica', 'Pearson', 'Director of Product', 20, NULL, 195000, '2019-02-20'),
        (6, 'Daniel', 'Kim', 'Product Designer', 20, 5, 110000, '2022-04-01'),
        (7, 'Rachel', 'Green', 'Marketing Specialist', 40, NULL, 85000, '2023-01-15');

      INSERT INTO projects VALUES
        (101, 'Cloud Data Lake Migration', 10, 500000, 'In Progress'),
        (102, 'Generative AI Assistant', 30, 850000, 'Active'),
        (103, 'Mobile App V2 Redesign', 20, 320000, 'Completed'),
        (104, 'Security & Compliance 2026', 10, 250000, 'Planning');
    `,
  },
  {
    id: 'banking_db',
    name: 'FinTech & Banking Database',
    category: 'Finance',
    description: 'Bank branches, accounts, account holders, transactions, and audit logs.',
    tables: [
      {
        name: 'customers',
        description: 'Bank account owners.',
        columns: [
          { name: 'cust_id', type: 'INTEGER', primaryKey: true },
          { name: 'full_name', type: 'TEXT', nullable: false },
          { name: 'credit_score', type: 'INTEGER' },
          { name: 'join_date', type: 'TEXT' },
        ],
        sampleRows: [
          { cust_id: 101, full_name: 'Robert Stark', credit_score: 780, join_date: '2020-03-12' },
          { cust_id: 102, full_name: 'Alicia Keys', credit_score: 810, join_date: '2019-11-04' },
          { cust_id: 103, full_name: 'Marcus Brody', credit_score: 640, join_date: '2023-05-20' },
          { cust_id: 104, full_name: 'Chloe Bennett', credit_score: 725, join_date: '2021-08-14' },
        ],
      },
      {
        name: 'accounts',
        description: 'Checking, savings, and investment accounts.',
        columns: [
          { name: 'account_id', type: 'TEXT', primaryKey: true },
          { name: 'cust_id', type: 'INTEGER', foreignKey: { table: 'customers', column: 'cust_id' } },
          { name: 'account_type', type: 'TEXT' },
          { name: 'balance', type: 'NUMERIC', nullable: false },
          { name: 'status', type: 'TEXT' },
        ],
        sampleRows: [
          { account_id: 'ACC-1001', cust_id: 101, account_type: 'Checking', balance: 14250.50, status: 'Active' },
          { account_id: 'ACC-1002', cust_id: 101, account_type: 'Savings', balance: 52400.00, status: 'Active' },
          { account_id: 'ACC-2001', cust_id: 102, account_type: 'Checking', balance: 8940.20, status: 'Active' },
          { account_id: 'ACC-3001', cust_id: 103, account_type: 'Checking', balance: 1250.00, status: 'Active' },
          { account_id: 'ACC-4001', cust_id: 104, account_type: 'Savings', balance: 24800.75, status: 'Active' },
        ],
      },
      {
        name: 'transactions',
        description: 'Ledger debits and credits.',
        columns: [
          { name: 'txn_id', type: 'INTEGER', primaryKey: true },
          { name: 'account_id', type: 'TEXT', foreignKey: { table: 'accounts', column: 'account_id' } },
          { name: 'txn_type', type: 'TEXT', description: 'Deposit, Withdrawal, Transfer' },
          { name: 'amount', type: 'NUMERIC', nullable: false },
          { name: 'txn_date', type: 'TEXT' },
          { name: 'merchant', type: 'TEXT' },
        ],
        sampleRows: [
          { txn_id: 9001, account_id: 'ACC-1001', txn_type: 'Withdrawal', amount: 85.50, txn_date: '2025-02-01', merchant: 'Whole Foods' },
          { txn_id: 9002, account_id: 'ACC-1001', txn_type: 'Deposit', amount: 4500.00, txn_date: '2025-02-05', merchant: 'Payroll Direct' },
          { txn_id: 9003, account_id: 'ACC-2001', txn_type: 'Withdrawal', amount: 120.00, txn_date: '2025-02-08', merchant: 'Shell Gas' },
          { txn_id: 9004, account_id: 'ACC-3001', txn_type: 'Withdrawal', amount: 35.00, txn_date: '2025-02-10', merchant: 'Starbucks' },
          { txn_id: 9005, account_id: 'ACC-4001', txn_type: 'Deposit', amount: 1500.00, txn_date: '2025-02-12', merchant: 'Wire Transfer' },
        ],
      },
    ],
    initSql: `
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS accounts;
      DROP TABLE IF EXISTS customers;

      CREATE TABLE customers (
        cust_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        credit_score INTEGER,
        join_date TEXT
      );

      CREATE TABLE accounts (
        account_id TEXT PRIMARY KEY,
        cust_id INTEGER,
        account_type TEXT,
        balance NUMERIC NOT NULL,
        status TEXT,
        FOREIGN KEY (cust_id) REFERENCES customers(cust_id)
      );

      CREATE TABLE transactions (
        txn_id INTEGER PRIMARY KEY,
        account_id TEXT,
        txn_type TEXT,
        amount NUMERIC NOT NULL,
        txn_date TEXT,
        merchant TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(account_id)
      );

      INSERT INTO customers VALUES
        (101, 'Robert Stark', 780, '2020-03-12'),
        (102, 'Alicia Keys', 810, '2019-11-04'),
        (103, 'Marcus Brody', 640, '2023-05-20'),
        (104, 'Chloe Bennett', 725, '2021-08-14');

      INSERT INTO accounts VALUES
        ('ACC-1001', 101, 'Checking', 14250.50, 'Active'),
        ('ACC-1002', 101, 'Savings', 52400.00, 'Active'),
        ('ACC-2001', 102, 'Checking', 8940.20, 'Active'),
        ('ACC-3001', 103, 'Checking', 1250.00, 'Active'),
        ('ACC-4001', 104, 'Savings', 24800.75, 'Active');

      INSERT INTO transactions VALUES
        (9001, 'ACC-1001', 'Withdrawal', 85.50, '2025-02-01', 'Whole Foods'),
        (9002, 'ACC-1001', 'Deposit', 4500.00, '2025-02-05', 'Payroll Direct'),
        (9003, 'ACC-2001', 'Withdrawal', 120.00, '2025-02-08', 'Shell Gas'),
        (9004, 'ACC-3001', 'Withdrawal', 35.00, '2025-02-10', 'Starbucks'),
        (9005, 'ACC-4001', 'Deposit', 1500.00, '2025-02-12', 'Wire Transfer');
    `,
  },
  {
    id: 'hospital_db',
    name: 'Hospital & Healthcare Database',
    category: 'Healthcare',
    description: 'Clinical database with patients, doctors, medical appointments, and prescribed medications.',
    tables: [
      {
        name: 'doctors',
        description: 'Hospital medical specialists.',
        columns: [
          { name: 'doctor_id', type: 'INTEGER', primaryKey: true },
          { name: 'doctor_name', type: 'TEXT', nullable: false },
          { name: 'specialization', type: 'TEXT' },
          { name: 'years_experience', type: 'INTEGER' },
        ],
        sampleRows: [
          { doctor_id: 1, doctor_name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', years_experience: 22 },
          { doctor_id: 2, doctor_name: 'Dr. Meredith Grey', specialization: 'General Surgery', years_experience: 16 },
          { doctor_id: 3, doctor_name: 'Dr. Shaun Murphy', specialization: 'Pediatric Surgery', years_experience: 8 },
          { doctor_id: 4, doctor_name: 'Dr. Cristina Yang', specialization: 'Cardiology', years_experience: 17 },
        ],
      },
      {
        name: 'patients',
        description: 'Hospital admissions and medical records.',
        columns: [
          { name: 'patient_id', type: 'INTEGER', primaryKey: true },
          { name: 'name', type: 'TEXT', nullable: false },
          { name: 'age', type: 'INTEGER' },
          { name: 'gender', type: 'TEXT' },
          { name: 'blood_group', type: 'TEXT' },
        ],
        sampleRows: [
          { patient_id: 301, name: 'James Wilson', age: 45, gender: 'M', blood_group: 'O+' },
          { patient_id: 302, name: 'Lisa Cuddy', age: 39, gender: 'F', blood_group: 'A+' },
          { patient_id: 303, name: 'Allison Cameron', age: 32, gender: 'F', blood_group: 'B+' },
          { patient_id: 304, name: 'Robert Chase', age: 36, gender: 'M', blood_group: 'AB-' },
        ],
      },
      {
        name: 'appointments',
        description: 'Clinical consultations and checkups.',
        columns: [
          { name: 'appointment_id', type: 'INTEGER', primaryKey: true },
          { name: 'patient_id', type: 'INTEGER', foreignKey: { table: 'patients', column: 'patient_id' } },
          { name: 'doctor_id', type: 'INTEGER', foreignKey: { table: 'doctors', column: 'doctor_id' } },
          { name: 'appointment_date', type: 'TEXT' },
          { name: 'diagnosis', type: 'TEXT' },
          { name: 'fee', type: 'NUMERIC' },
        ],
        sampleRows: [
          { appointment_id: 101, patient_id: 301, doctor_id: 1, appointment_date: '2025-01-10', diagnosis: 'Sarcoidosis Evaluation', fee: 250 },
          { appointment_id: 102, patient_id: 302, doctor_id: 4, appointment_date: '2025-01-14', diagnosis: 'Arrhythmia Checkup', fee: 300 },
          { appointment_id: 103, patient_id: 303, doctor_id: 2, appointment_date: '2025-01-20', diagnosis: 'Post-op Followup', fee: 180 },
          { appointment_id: 104, patient_id: 304, doctor_id: 3, appointment_date: '2025-02-02', diagnosis: 'Abdominal Consultation', fee: 200 },
        ],
      },
    ],
    initSql: `
      DROP TABLE IF EXISTS appointments;
      DROP TABLE IF EXISTS patients;
      DROP TABLE IF EXISTS doctors;

      CREATE TABLE doctors (
        doctor_id INTEGER PRIMARY KEY,
        doctor_name TEXT NOT NULL,
        specialization TEXT,
        years_experience INTEGER
      );

      CREATE TABLE patients (
        patient_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        blood_group TEXT
      );

      CREATE TABLE appointments (
        appointment_id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        doctor_id INTEGER,
        appointment_date TEXT,
        diagnosis TEXT,
        fee NUMERIC,
        FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
      );

      INSERT INTO doctors VALUES
        (1, 'Dr. Gregory House', 'Diagnostic Medicine', 22),
        (2, 'Dr. Meredith Grey', 'General Surgery', 16),
        (3, 'Dr. Shaun Murphy', 'Pediatric Surgery', 8),
        (4, 'Dr. Cristina Yang', 'Cardiology', 17);

      INSERT INTO patients VALUES
        (301, 'James Wilson', 45, 'M', 'O+'),
        (302, 'Lisa Cuddy', 39, 'F', 'A+'),
        (303, 'Allison Cameron', 32, 'F', 'B+'),
        (304, 'Robert Chase', 36, 'M', 'AB-');

      INSERT INTO appointments VALUES
        (101, 301, 1, '2025-01-10', 'Sarcoidosis Evaluation', 250),
        (102, 302, 4, '2025-01-14', 'Arrhythmia Checkup', 300),
        (103, 303, 2, '2025-01-20', 'Post-op Followup', 180),
        (104, 304, 3, '2025-02-02', 'Abdominal Consultation', 200);
    `,
  },
];
