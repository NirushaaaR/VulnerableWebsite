import { useState, useEffect } from 'react';

import TodoItem from './TodoItem'

import { firestore, auth } from '../firebase';


const TodoList = () => {

    const [todo, setTodo] = useState([]);
    const [task, setTask] = useState("");

    const create = async (e) => {
        if (auth.currentUser) {
            const taskData = {
                task,
                done: false,
                createdDate: Date.now(),
                uid: auth.currentUser.uid,
            }
            const doc = await firestore.collection("tasks").add(taskData);
            taskData.id = doc.id;
            setTodo([taskData, ...todo]);
            setTask("");
            
        } else {
            alert("Not Login!!");
        }
    }

    const deleteTodoById = async id => {
        console.log("delete", id);
        try {
            await firestore.collection("tasks").doc(id).delete();
            const newTodoList = todo.filter(t => t.id !== id);
            setTodo(newTodoList);
        } catch (error) {
            console.log(error);
        }
    }

    const toggleTodo = async id => {
        console.log("toggle", id);
        try {
            const idx = todo.findIndex(t => t.id === id);
            const newTodoList = [...todo];

            newTodoList[idx].done = !newTodoList[idx].done;

            await firestore.collection("tasks").doc(id).update(newTodoList[idx]);

            setTodo(newTodoList);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (auth.currentUser) {
            firestore
                .collection("tasks")
                .where("uid", "==", auth.currentUser.uid)
                .get()
                .then(snapshot => {
                    const data = snapshot.docs.map(d => ({
                        ...d.data(),
                        id: d.id
                    }));
                    setTodo(data);
                })
                .catch(error => console.log(error));
        }
    }, [])

    return (
        <>
            <div className="row m-1 p-3">
                <div className="col col-11 mx-auto">
                    <div className="row bg-white rounded shadow-sm p-2 add-todo-wrapper align-items-center justify-content-center">
                        <div className="col">
                            <input className="form-control form-control-lg border-0 add-todo-input bg-transparent rounded" type="text" placeholder="สร้างเพิ่ม .." value={task} onChange={e => setTask(e.target.value)} />
                        </div>
                        <div className="col-auto px-0 mx-0 mr-2">
                            <button type="button" className="btn btn-primary" onClick={create}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-2 mx-4 border-black-25 border-bottom"></div>
            <div className="row mx-1 px-5 pb-3 w-80">
                <div className="col mx-auto">
                    {todo.map(t => (<TodoItem todo={t} key={t.id} deleteTodo={deleteTodoById} toggleTodo={toggleTodo} />))}
                </div>
            </div>
        </>
    )
}

export default TodoList
