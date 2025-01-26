import React from 'react'
import { Badge, Button, Table, Card, Modal } from 'react-bootstrap'
import { useLocation, Link } from 'react-router-dom'
import EmployeeFilter from './EmployeeFilter.jsx'
import EmployeeAdd from './EmployeeAdd.jsx'


function EmployeeTable(props) {
    // GET THE URL
    const { search } = useLocation()
    // GET THE PARAMETERS FROM THE URL
    const query = new URLSearchParams(search)
    // GET THE 'EMPLOYED' PARAMETER SPECIFICALLY
    const q = query.get('employed')

    const employeeRows = props.employees
        .filter(employee => (q ? String(employee.currentlyEmployed) === q : true))
        .map(employee => 
        <EmployeeRow 
            key={employee._id} 
            employee={employee} 
            deleteEmployee={props.deleteEmployee} />)
    return (
	<Card>
	    <Card.Header as="h5">All Employees<Badge bg="secondary">{employeeRows.length}</Badge></Card.Header>
	     <Card.Body>
	      <Card.Text>
		<Table striped size="sm">
		    <thead>
			<tr>
			    <th>Name</th>
			    <th>Extension</th>
			    <th>Email</th>
			    <th>Title</th>
			    <th>Date Hired</th>
			    <th>Currently Employed?</th>
			    <th></th>
			</tr>
		    </thead>
		    <tbody>
			{employeeRows}
		    </tbody>
		</Table>
	      </Card.Text>
	    </Card.Body>
	</Card>
    )
}

function EmployeeRow(props) {
    const [showModal, setShowModal] = React.useState(false);

    function showDeleteModal() {
        setShowModal(true)
    }
    function handleClose() {
        setShowModal(false);
    }

    function handleDeleteConfirm() {
        props.deleteEmployee(props.employee._id);
        setShowModal(false);
    }
    return (
	<>
        <tr>
            <td><Link to={`/edit/${props.employee._id}`}>{props.employee.name}</Link></td>
            <td>{props.employee.extension}</td>
            <td>{props.employee.email}</td>
            <td>{props.employee.title}</td>
            <td>{props.employee.dateHired.toDateString()}</td>
            <td>{props.employee.currentlyEmployed ? 'Yes' : 'No'}</td>
            <td><Button variant="danger" size="sm" onClick={showDeleteModal}>X</Button></td>
        </tr>
	<Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Delete Employee</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {props.employee.name}?
                </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={handleClose}>Cancel</Button>
                <Button variant="danger" onClick={handleDeleteConfirm}>Yes</Button>
            </Modal.Footer>
        </Modal>
	</>
    )
}

export default class EmployeeList extends React.Component {
    constructor() {
        super()
        this.state = { employees: [] }
        this.createEmployee = this.createEmployee.bind(this)
        this.deleteEmployee = this.deleteEmployee.bind(this)
    }
    componentDidMount() {
        this.loadData()
    }
    loadData() {
        fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            data.employees.forEach(employee => {
                employee.dateHired = new Date(employee.dateHired)
            })
            this.setState({ employees: data.employees })
        })
        .catch(err => {console.log(err)})
    }
    createEmployee(employee) {
        fetch('/api/employees', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(employee),
        })
        .then(response => response.json())
        .then(newEmployee => {
            newEmployee.employee.dateHired = new Date(newEmployee.employee.dateHired)
            const newEmployees = this.state.employees.concat(newEmployee.employee)
            this.setState({ employees: newEmployees })
            console.log('Total count of employees:', newEmployees.length)
        })
        .catch(err => {console.log(err)})
    }
    deleteEmployee(id) {
        fetch(`/api/employees/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                console.log('Failed to delete employee.')
            } else {
                this.loadData()
            }
        })
    }
    render() {
        return (
            <React.Fragment>
		<EmployeeAdd createEmployee={this.createEmployee} />
                <EmployeeFilter />
                <EmployeeTable employees={this.state.employees} deleteEmployee={this.deleteEmployee} />
            </React.Fragment>
        )
    }
}
