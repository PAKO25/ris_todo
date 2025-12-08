import type User from "../user/user.ts";
import type todoItem from "../todoItem/todoItem.ts";

export default class todoList{
    id:number;
    title:string;
    isShared:boolean;
    owner:User;
    todoItemList?:todoItem[];

    constructor(
        id:number,
        title:string,
        isShared:boolean,
        owner:User
    ) {
        this.id = id;
        this.title = title;
        this.isShared = isShared;
        this.owner = owner;
    }

    setTodoItemList(todo_item_list:todoItem[]):void{
        this.todoItemList = todo_item_list;
    }

    getTodoItemList():todoItem[]{
        return this.todoItemList || [];
    }

}