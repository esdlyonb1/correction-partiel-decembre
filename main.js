let baseUrl = "https://esdexamen.tk/b1devweb/api/";

let loggedIn = false
const content = document.querySelector("#content")

//data from api
let token=null
let posts = null
let currentUsername = null
// to fetch everything like a lazy person :

async function doTheFetchThingForMeIamVeryLazy(urlSuffix,method, body = null, needsToken=false){

    let theHeaders = {"Content-type":"application/json"}
    let params = {
        method : method,
        headers : theHeaders,

    }

    if(needsToken)
        {
           theHeaders = {"Content-type":"application/json", "Authorization" : `Bearer ${token}`}
        }

    if(body){
         params = {
            method : method,
            headers : theHeaders,
            body: JSON.stringify(body)
             }
        }
    let url = baseUrl+urlSuffix

    let response = await fetch(url,params)
    let data = await response.json()

    return data


}


//API Interactions
function register(){
    const usernameField = document.querySelector("#usernameRegister")
    const passwordField = document.querySelector("#passwordRegister")

    let username = usernameField.value
    let password = passwordField.value

    if(password !== "" && username !== "")
    {
        let body = {username:username,password:password}

        doTheFetchThingForMeIamVeryLazy("registeruser","POST",body)
            .then((data)=> {
                if(data == "username already taken"){
                    alert(data)
                    showRegisterForm()
                }else if(data.username)
                {
                    alert("successfully register, you can now log in")
                    showLoginForm()
                }
            })
    }

}
function login(){
    const usernameField = document.querySelector("#usernameLogin")
    const passwordField = document.querySelector("#passwordLogin")

    let username = usernameField.value
    let password = passwordField.value

    if(password !== "" && username !== "")
    {
        let body = {
            username:username,
            password:password
        }

        doTheFetchThingForMeIamVeryLazy("login_check","POST",body)
            .then(data=> {
                        if(data.token){
                            token = data.token
                            loggedIn = true
                            currentUsername = username
                            showPosts()

                        }else{
                            alert("wrong credentials")
                            showLoginForm()
                        }


                }

            )

    }

}

function sendPost()

///here
function deletePost(id){
    console.log(token)
    doTheFetchThingForMeIamVeryLazy(`posts/${id}`,"DELETE",null,true)
        .then(data=>{

            if(data =="Resource not found")
            {
                alert("this post was not found, watcha tryna do anyways ?")
            }
            if(data=="Post resource deleted")
            {
                alert("this post was deleted, you'll never see it again")
                showPosts()
            }

        })
}
function editPost(){}
function writeComment(){}
function deleteComment(){}
function editComment(){}


// Template stuff
function display(template)
{
    content.innerHTML = template
    if(loggedIn){

        let postFormButton =`<button class="btn nav-link active" aria-current="page" id="postForm">Write Post</button>`
        const navbar = document.querySelector(".navbar-nav")
        navbar.innerHTML=postFormButton
        const postFormButtonInNav = document.querySelector("#postForm")
        postFormButtonInNav.addEventListener("click",()=>{showWritePostForm()})
    }
}
function showRegisterForm()
{
    let template = `<div class="d-flex flex-column align-items-center justify-content-center">

                        <h3>Register</h3>
                                <div class="form-group">
                                    <input class="form-control" type="text" id="usernameRegister" placeholder="your username">
                                </div>
                                <div class="form-group">
                                    <input class="form-control" type="password" id="passwordRegister" placeholder="your password">
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-success form-control" id="submitRegister">Submit</button>
                                </div>
                                 <div class="form-group">
                                    <small>Already got an account ?</small>
                                    <button class="btn btn-success form-control" id="goToLogin">Go to Log-in form</button>
                                </div>
                    
                    </div>`

    display(template)

    const submitButton = document.querySelector("#submitRegister")
    const goLogInButton = document.querySelector("#goToLogin")

    submitButton.addEventListener("click", ()=>{register()})
    goLogInButton.addEventListener("click", ()=>{showLoginForm()})

}
function showLoginForm()
{
    let template = `<div class="d-flex flex-column align-items-center justify-content-center">

                        <h3>Log in</h3>
                                <div class="form-group">
                                    <input class="form-control" type="text" id="usernameLogin" placeholder="your username">
                                </div>
                                <div class="form-group">
                                    <input class="form-control" type="password" id="passwordLogin" placeholder="your password">
                                </div>
                                <div class="form-group">
                                    <button class="btn btn-success form-control" id="submitLogin">Submit</button>
                                </div>
                                <div class="form-group">
                                    <small>No account yet ?</small>
                                    <button class="btn btn-primary form-control" id="createAccount">Create Account</button>
                                </div>
                    
                    </div>`

    display(template)

    const submitButton = document.querySelector("#submitLogin")
    const createAccountButton = document.querySelector("#createAccount")

    submitButton.addEventListener("click", ()=>{login()})
    createAccountButton.addEventListener("click", ()=>{showRegisterForm()})

}
function generatePostTemplate(post)
{
    let ownerButtons = ``
    if(post.user.username == currentUsername)
    {
        ownerButtons = `
                          <button class="btn btn-warning editPostButton">Edit</button>
                          <button class="btn btn-danger deletePostButton">Delete</button>
    
                        `
    }



    return `<div class="post mt-3">
                            <hr>
                            <p>${post.content}</p>
                        
                            <p><strong>Author : </strong>${post.user.username}</p>
                            <p><strong>Date :</strong>${post.createdAt}</p>
                            <button class="btn btn-success returnButton">Return</button>
                            ${ownerButtons}
                            <hr>
                        </div>`
}
function generatePostsTemplate(posts)
{
    let fullTemplate = ``
    posts.forEach((post)=>{
        fullTemplate+=
                       `<div class="post mt-3">
                            <hr>
                            <p>${post.content}</p>
                        
                            <p><strong>Author : </strong>${post.user.username}</p>
                            <p><strong>Date :</strong>${post.createdAt}</p>
                            <button class="btn btn-success showPostButton" id="${post.id}">Read more</button>
                            <hr>
                        </div>`
    })
    return fullTemplate

}
function showPosts()
{

    if(!loggedIn){
        return display(`you are not logged in`)
    }

    doTheFetchThingForMeIamVeryLazy("posts","GET",null,true)
        .then((data)=>{
            console.log(data)

            posts = data["hydra:member"]
            //let's reverse the array so the last post comes first
            posts.reverse()

            let postsTemplate = generatePostsTemplate(posts)

            display(postsTemplate)

            let readMoreButtons = document.querySelectorAll(".showPostButton")
            readMoreButtons.forEach((button)=>{
                button.addEventListener("click",()=>{
                    showPost(button.id)
                })
            })


        })



}
function showPost(id)
{

    if(!loggedIn){
        return display(`you are not logged in`)
    }

    doTheFetchThingForMeIamVeryLazy(`posts/${id}`,"GET",null,true)
        .then((data)=>{
            post = data

            let postTemplate = ""

            postTemplate = generatePostTemplate(post)

            display(postTemplate)

            const returnButton = document.querySelector(".returnButton")
            const deletePostButton = document.querySelector(".deletePostButton")
            const editPostButton = document.querySelector(".editPostButton")
            returnButton.addEventListener("click",()=>{showPosts()})
            deletePostButton.addEventListener("click",()=>{deletePost(post.id)})
            editPostButton.addEventListener("click",()=>{showPostEditor()})



        })



}
function showWritePostForm()
{
    let form = `<div class="sendPost">
                    <div class="form group">
                        <textarea class="form-control" id="sendPostContent" cols="30" rows="10" placeholder="You can write your post here"></textarea>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-success form-control sendPostButton">Post !</button>
                    </div>
                </div>`
    display(form)
    const sendPostButton = document.querySelector(".sendPostButton")
    sendPostButton.addEventListener("click", ()=>{sendPost()})
}







showLoginForm()
