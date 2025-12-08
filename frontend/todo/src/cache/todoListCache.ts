import todoList from "../structures/todoList/todoList.ts";

let user_todoListCache: todoList[] | null = null;

export function set_user_todoListCache(todo_list: todoList[]):void{
    user_todoListCache = todo_list;
}

export function get_user_todoListCache_all():todoList[]{
    if (user_todoListCache == null) { return []; }
    return user_todoListCache;
}

export function get_user_todoListCache_by_title(list_title:string):todoList | null | undefined{
    if(user_todoListCache != null) {
        for (let index = 0; index < user_todoListCache.length; index++) {
            if (list_title == user_todoListCache?.at(index)?.title) {
                return user_todoListCache?.at(index) || undefined;
            }

        }
    }
    return null;
}