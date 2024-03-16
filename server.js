// Import and require external packages
const inquirer = require("inquirer");
const mysql = require('mysql2');
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    //  MySQL username,
    user: process.env.DB_USER,
    // MySQL password 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  console.log(`Connected to the company_db database.`)
);

//======================================== MAIN SELECTION ==================================//

//============== optional : for error-checking the connection =========//

db.connect(function (err) {
  if (err) {
    throw err
  }
  console.log(" we have connected to the database")
  mainSelection();
});
//===================================================================//

//=============================================================================//
//                                Inquirer Prompts                             //
//=============================================================================//

function mainSelection() {
  // questions for user input
  inquirer.prompt([
    {
      type: 'list',
      name: 'main',
      message: 'What would you like to do?',
      choices:
        [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add A Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
          "Delete a Department",
          "Delete a Role",
          "Delete an Employee",
          "Quit"
        ],
    },
  ])

    // if statement linking main prompt answer to next function
    .then((answer) => {
      // error-checking
      console.log(answer);
      console.log(answer.main);
      //
      if (answer.main === "View All Departments") {
        viewDepartments();
      } else if (answer.main === "View All Roles") {
        viewRoles();
      } else if (answer.main === "View All Employees") {
        viewEmployees();
      } else if (answer.main === "Add A Department") {
        addDepartment();
      } else if (answer.main === "Add Role") {
        addRole();
      } else if (answer.main === "Add Employee") {
        addEmployee();
      } else if (answer.main === "Update Employee Role") {
        updateEmployeeRole();
      } else if (answer.main === "Delete a Department") {
        deleteDepartment();
      } else if (answer.main === "Delete a Role") {
        deleteRole();
      } else if (answer.main === "Delete an Employee") {
        deleteEmp();
      } else if (answer.main === "Quit") {
        quit();
      }
    })

    .catch((err) => {
      console.log(err.message);
    });
}

//======================================== view all departments ==================================//

const viewDepartments = () => {
  const sql =
    `
    SELECT * FROM department
    `
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.table(rows);
    mainSelection();
  });
};

//======================================== view all roles ==================================//

const viewRoles = () => {
  const sql =
    `
  SELECT role.id, 
  title AS role, 
  salary, 
  department.department_name AS department FROM role 
  JOIN department ON department_id = department.id
  `
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.table(rows);
    mainSelection();
  });
};


//======================================== view all employees ==================================//

const viewEmployees = () => {
  const sql =
    `
  SELECT employee.id, 
  first_name, 
  last_name, 
  role.title AS role, 
  department.department_name AS department, 
  salary,
  manager_id FROM employee 
  JOIN role ON employee.role_id = role.id 
  JOIN department ON role.department_id = department.id;
  `
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.table(rows);
    mainSelection();
  });
};

//======================================== add a department ==================================//


const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departName',
      message: 'What is the name of the new department?'
    },
  ])
    .then((answer) => {
      const sql =
        `
      INSERT INTO department (department_name) VALUES (?)
      `
      const param = answer.departName;
      db.query(sql, param, (err, result) => {
        if (err) {
          throw err;
        } else {
          //console.log('\n New department has been added');
          console.log(`\n New department ${answer.departName} has been added`);
          mainSelection();
        }
      })
    })
}

//======================================== add a role ==================================//

const addRole = () => {

  // this means:
  //            - select the relevant field of the relevant table (here, role_id OF role table) 
  //            - names of departments from department table
  //            - 'name' after table field is part of the query format 
  db.query('SELECT id value, department_name name FROM department', (err, data) => {

    //console.log(data);
    inquirer.prompt([
      {
        type: 'input',
        name: 'roleName',
        message: 'What is the name of the new role?'
      },
      {
        type: 'number',
        name: 'roleSalary',
        message: 'What is the salary of the role?'
      },
      {
        type: 'list',
        name: 'roleDept',
        message: 'Which department does the role belong to?',
        choices: data   //////  this will display the entries grabbed from above db.query line
      },
    ])

      // 
      .then(({ roleName, roleSalary, roleDept }) => {
        console.log(roleName, roleSalary, roleDept)
        const sql =
          `
        INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)
        `
        const params = [roleName, roleSalary, roleDept];
        db.query(sql, params, (err) => {
          if (err) {
            throw err;
          } else {
            console.log(`\n New role ${roleName} has been added`);
            mainSelection();
          }
        })
      })
  })
};

//====================================== add an employee ==================================//


const addEmployee = () => {
  // this will link the answer to separate first and last name fields and join (concat) them as one result
  db.query('SELECT id value, title name FROM role', (err, data) => {
    db.query("SELECT id value, concat(first_name, ' ' , last_name) name FROM employee WHERE manager_id is null", (err, managerData) => {

      inquirer.prompt([
        {
          type: 'input',
          name: 'eFirstName',
          message: 'Enter first name of new employee'
        },
        {
          type: 'input',
          name: 'eLastName',
          message: 'Enter last name of new employee'
        },
        {
          type: 'list',
          name: 'eRole',
          message: 'Select role of new employee',
          choices: data
        },
        {
          type: 'list',
          name: 'eManager',
          message: 'Select the manager of the new employee',
          choices: managerData

        },
      ])
        .then(({ eFirstName, eLastName, eRole, eManager }) => {
          console.log(eFirstName, eLastName, eRole, eManager)
          const sql =
            `
            INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)
            `
          const params = [eFirstName, eLastName, eRole, eManager];
          db.query(sql, params, (err) => {
            if (err) {
              throw err;
            } else {
              // template literal (backtick) will preserve all space/whitespace so names will be separated 
              // https://www.stanleyulili.com/javascript/template-literals-in-javascript-explained-like-your-twelve
              console.log(`\n New employee ${eFirstName} ${eLastName} has been added`);
              mainSelection();
            }
          })
        })
    })
  })
};

//======================================== update employee role ==================================//

const updateEmployeeRole = () => {

  db.query("select id value, title name from role", (err, data) => {
    db.query("select id value, concat(first_name, ' ' , last_name) name from employee", (err, employeeData) => {


      inquirer.prompt([
        {
          type: 'list',
          name: 'selectEmp',
          message: 'Select the employee',
          choices: employeeData
        },
        {
          type: 'list',
          name: 'newRole',
          message: 'What role do you want to asign them?',
          choices: data
        },
      ])
        .then(({ newRole, selectEmp }) => {
          console.log(newRole, selectEmp)
          const sql =
            `
UPDATE employee 
SET role_id = ? 
WHERE id = ?
`
          const params = [newRole, selectEmp];
          db.query(sql, params, (err) => {
            if (err) {
              throw err;
            } else {
              console.log(`Employee role has been updated with new role, ${newRole}`);
              mainSelection();
            }
          })
        })
    })
  })
};


//======================================== delete Department ==================================//

// https://www.tutorialsteacher.com/sql/sql-delete-statement#:~:text=You%20can%20delete%20the%20specific,value%20of%20EmpId%20is%204.&text=DELETE%20FROM%20Employee%20WHERE%20EmpId,will%20display%20the%20following%20rows.

const deleteDepartment = () => {

  db.query("select id value, department_name name from department", (err, data) => {


    inquirer.prompt([
      {
        type: 'list',
        name: 'selectDept',
        message: 'Which department do you want to remove?',
        choices: data
      },
    ])
      .then(({ selectDept }) => {
        console.log(selectDept)
        const sql =
          `
DELETE FROM department
WHERE id = ?
`
        const params = [selectDept];
        db.query(sql, params, (err) => {
          if (err) {
            throw err;
          } else {
            console.log(`Department has been removed`);
            mainSelection();
          }
        })
      })
  })
};

//======================================== delete a Role ==================================//


const deleteRole = () => {

  db.query("select id value, title name from role", (err, data) => {

    inquirer.prompt([
      {
        type: 'list',
        name: 'selectRole',
        message: 'Which role do you want to remove?',
        choices: data
      },
    ])
      .then(({ selectRole }) => {
        console.log(selectRole)
        const sql =
          `
DELETE FROM role
WHERE id = ?
`
        const params = [selectRole];
        db.query(sql, params, (err) => {
          if (err) {
            throw err;
          } else {
            console.log(`Role has been removed`);
            mainSelection();
          }
        })
      })
  })
};

//======================================== delete an employee ==================================//


const deleteEmp = () => {


  db.query("select id value, concat(first_name, ' ' , last_name) name from employee", (err, data) => {

    inquirer.prompt([
      {
        type: 'list',
        name: 'selectEmp',
        message: 'Select the employee you want to delete',
        choices: data
      },
    ])
      .then(({ selectEmp }) => {
        console.log(selectEmp)
        const sql =
          `
  DELETE FROM employee 
  WHERE id = ?

  `
        const params = [selectEmp];
        db.query(sql, params, (err) => {
          if (err) {
            throw err;
          } else {
            console.log(`Employee has been removed`);
            mainSelection();
          }
        })
      })
  })
};

//======================================== end app ==================================//

const quit = () => {

  console.log('\n App has been exited. Goodbye!')
  process.exit(0)
}