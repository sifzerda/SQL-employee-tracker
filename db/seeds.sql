INSERT INTO department (department_name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role ( title, salary, department_id)
VALUES ("Sales Lead", 100000, 4),
       ("Salesperson", 80000, 4),
       ("Lead Engineer", 150000, 1),
       ("Software Engineer", 120000, 1),
       ("Account Manager", 160000, 2),
       ("Accountant", 125000, 2),
       ("Legal Team Lead", 250000, 3),
       ("Lawyer", 190000, 3);
       
INSERT INTO employee ( first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 2, null),
       ("Mike", "Chan", 2, null ),
       ("Ashley", "Rodriguez", 3, 1),
       ("Kevin", "Tupik", 4, 2),
       ("Kunal", "Singh", 4, 2),
       ("Malia", "Brown", 5, 1),
       ("Sarah", "Lourd", 5, 1),
       ("Tom", "Allen", 1, 1);
       
