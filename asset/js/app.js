//JavaScript for toggling password visibility
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password') || document.getElementById('log-password');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirmPassword') || document.getElementById('log-confirmPassword');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', () => {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            togglePassword.style.fill = type === 'password' ? '#888' : '#000000';
        });
    }

    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            toggleConfirmPassword.style.fill = type === 'password' ? '#888' : '#000000';
        });
    }
});

import { auth, createUserWithEmailAndPassword, GoogleAuthProvider, provider, signInWithPopup, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged, deleteUser, db, getFirestore, collection, addDoc, doc, setDoc, getDocs, getDoc, updateDoc, serverTimestamp, deleteDoc } from "./firebase.js";

// Auth state listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User signed in:", user.email);
        if (!user.emailVerified && !window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('signup.html') && !window.location.pathname.endsWith('email-validation.html')) {
            window.location.href = 'email-validation.html';
        }
    } else {
        console.log("User signed out");
        localStorage.removeItem('user');
        if (!window.location.pathname ==='/index.html' && !window.location.pathname ==='asset/login.html' && !window.location.pathname ==='asset/signup.html' && !window.location.pathname==='/asset/email-validation.html') {
            window.location.href = 'login.html';
        }
    }
});

// __________________________Sinup-page__________________________________

let signUp = () => {
    event.preventDefault();
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let userData = {
        name: name,
        email: email,
    }

    console.log(userData);

    if (emailRegex.test(email) && passwordRegex.test(password)) {
        console.log("test");
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log(user);
                localStorage.setItem("user", JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: name
                }));
                window.Swal.fire({
                    icon: 'success',
                    title: 'Account Created',
                    text: 'Your Account Is Created Successfully',
                    timer: 8000,
                    timerProgressBar: true,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    window.location.href = "email-validation.html";
                }, 3000);
                try {
                    await setDoc(doc(db, "users", user.uid), {
                        ...userData,
                        uID: user.uid
                    });
                    console.log("Document written with ID: ", user.uid);
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            })
            .catch((error) => {
                alert("The Error Is: " + error.code);
                console.log(error.message);
            });
    }
    else {
        alert("Invalid email or Password");
    }
    if (password !== confirmPassword) {
        alert("Your Password Should Be Identical")
    }
};
if (window.location.pathname === '/asset/signup.html') {
    let signupForm = document.getElementById("signupForm");
    signupForm.addEventListener("submit", signUp);
}

// ______________________________Signup with google________________________________

let signupGoogle = () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user);
            setTimeout(() => {
                window.location.href = "email-validation.html";
            }, 3000);
            try {
                const userData = {
                    name: user.displayName || "",
                    email: user.email || ""
                };
                localStorage.setItem("user", JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || ""
                }));
                await setDoc(doc(db, "users", user.uid), {
                    ...userData,
                    uID: user.uid
                });
                console.log("Document written with ID: ", user.uid);
            } catch (e) {
                console.error("Error adding document: ", e);
            }

        })
        .catch((error) => {
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(email, credential);
            // alert(error.code)
        });
};

if (window.location.pathname == "/asset/signup.html") {
    let signUpGoogleBtn = document.getElementById("sign-up-gmail-btn");
    signUpGoogleBtn.addEventListener("click", signupGoogle);
};

// ________________________________________________mail-verificaton___________________________________

let sendMail = () => {
    sendEmailVerification(auth.currentUser)
        .then(async () => {
            Swal.fire({
                icon: 'success',
                title: 'Email Verification Sent',
                text: 'A verification email has been sent to your email address.',
                confirmButtonText: 'OK'
            });
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 3000);
        })
};

if (window.location.pathname === '/asset/email-validation.html') {
    let validation = document.getElementById("verify-email");
    validation.addEventListener("click", sendMail)
};

// ____________________________logIn-page___________________________________________

let logIn = () => {
    event.preventDefault();
    console.log("hello");

    const logEmail = document.getElementById("log-email").value.trim();
    const logPassword = document.getElementById("log-password").value;
    const logConfirmPassword = document.getElementById("log-confirmPassword").value;

    if (!logEmail || !logPassword) {
        alert("Please enter both email and password.");
        return;
    }

    if (logPassword !== logConfirmPassword) {
        alert("Password and Confirm Password do not match.");
        return;
    }

    signInWithEmailAndPassword(auth, logEmail, logPassword)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log(user);
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let userName = "";
            let photoURL = "";
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                userName = data.name || "";
                photoURL = data.photoURL || "";
            }
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: userName,
                photoURL: photoURL
            }));
            window.Swal.fire({
                title: 'Log-In Successful!',
                text: 'You have logged in successfully.',
                icon: 'success',
                timer: 4000,
                timerProgressBar: true,
            });
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 3000);
        })
        .catch((error) => {
            console.error("Login Error:", error.code, error.message);
            alert("Login failed: " + error.message);
        });
};

if (window.location.pathname === "/asset/login.html") {
    let loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", logIn);
}
// _________________________________________forgetpassword_______________________________________________

let forgetPassword = () => {
    const forEmail = document.getElementById("log-email").value;
    if (!forEmail) {
        alert("Please enter your email address to reset password.");
        return;
    }
    sendPasswordResetEmail(auth, forEmail)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Email Sent',
                text: 'A Password Reset Link Has Been Sent To Your Email',
                confirmButtonText: 'OK'
            });
        })
        .catch((error) => {
            alert(error.code || error.message || "An error occurred while sending the password reset email.");
        })
};

if (window.location.pathname === "/asset/login.html") {
    let resetpass = document.getElementById("forget-password-btn");
    resetpass.addEventListener("click", forgetPassword);
};

// ______________________________Login with google________________________________

let loginGoogle = () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log(user);
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 3000);
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                let userName = user.displayName || "";
                let photoURL = "";
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    userName = data.name || userName;
                    photoURL = data.photoURL || "";
                }
                localStorage.setItem("user", JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: userName,
                    photoURL: photoURL
                }));
                // For login, user should already exist, no need to setDoc
            } catch (e) {
                console.error("Error: ", e);
            }

        })
        .catch((error) => {
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            alert(email, credential);
        });
};

if (window.location.pathname === "/asset/login.html") {
    let loginGoogleBtn = document.getElementById("login-google-btn");
    loginGoogleBtn.addEventListener("click", loginGoogle);
};

// ___________________________display-profile-name-on-dashboard____________________________

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname ==='/asset/dashboard.html') {
        const userStr = localStorage.getItem('user');
        console.log("User from localStorage:", userStr);
        if (userStr) {
            const user = JSON.parse(userStr);
            const profileNameSpan = document.getElementsByClassName('profile-name');
            console.log("Profile name span element:", profileNameSpan);
            if (profileNameSpan.length > 0) {
                profileNameSpan[0].textContent = user.name ? user.name : "Profile";
                console.log("Profile name to:", profileNameSpan[0].textContent);
            }
            console.log("User photoURL:", user.photoURL);
            const dashboardImg = document.querySelector('.profile-icon');
            if (dashboardImg && user.photoURL) {
                dashboardImg.src = user.photoURL;
                console.log("Profile image src updated");
            } else {
                console.log("Profile image element not found or photoURL missing");
            }
        }
    }
});


// __________________________update Profile_____________________________________

const updateProfile = async (event) => {
    event.preventDefault();

    const cloudName = 'dbdinegjx';
    const unSignedUpload = 'Unsigned';
    const imageInput = document.getElementById('userProfilePhoto');
    const file = imageInput.files[0];
    const updateName = document.getElementById('profileUserName').value;
    const updateEmailValue = document.getElementById('profileEmail').value;
    const currentPassword = document.getElementById('CurrentPassword').value;
    const updatePasswordValue = document.getElementById('NewPassword').value;
    const user = auth.currentUser;

    if (!user) {
        alert("No user is currently logged in.");
        console.log("No user logged in");
        return;
    }

    if (!user.emailVerified) {
        alert("Please verify your email before updating your profile.");
        return;
    }

    const isUpdatingSensitive = (updateEmailValue && updateEmailValue.trim() !== '' && updateEmailValue !== user.email) || (updatePasswordValue && updatePasswordValue.trim() !== '');

    if (isUpdatingSensitive && (!currentPassword || currentPassword.trim() === '')) {
        alert("Current password is necessary to update email or password.");
        return;
    }

    if (isUpdatingSensitive) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            console.log("Reauthentication successful!");
        } catch (error) {
            console.error("Reauthentication failed:", error);
            alert("Reauthentication failed: " + error.message);
            return;
        }
    }

    try {
        let imageUrl = null;

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', unSignedUpload);
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            imageUrl = data.secure_url;
        }

        const userDocRef = doc(db, "users", user.uid);
        let updateData = {};

        if (updateEmailValue && updateEmailValue.trim() !== '' && updateEmailValue !== user.email) {
            console.log("Updating email to:", updateEmailValue);
            await updateEmail(user, updateEmailValue);
            await sendEmailVerification(user);
            updateData.email = updateEmailValue;
        }

        if (updateName && updateName.trim() !== '') {
            updateData.name = updateName;
        }

        if (imageUrl) {
            console.log("Updating profile photo to:", imageUrl);
            updateData.photoURL = imageUrl;
        }

        if (Object.keys(updateData).length > 0) {
            await updateDoc(userDocRef, updateData);
        }

        if (updatePasswordValue && updatePasswordValue.trim() !== '') {
            console.log("Updating password...");
            await updatePassword(user, updatePasswordValue);
        }

        let localUser = JSON.parse(localStorage.getItem('user'));
        if (updateName) localUser.name = updateName;
        if (imageUrl) localUser.photoURL = imageUrl;
        if (updateEmailValue) localUser.email = updateEmailValue;
        localStorage.setItem('user', JSON.stringify(localUser));

        const profileImg = document.getElementById('UserProfileImg');
        if (profileImg && imageUrl) profileImg.src = imageUrl;

        const dashboardImg = document.querySelector('.profile-icon');
        if (dashboardImg && imageUrl) {
            dashboardImg.src = imageUrl;
        }

        Swal.fire({
            icon: 'success',
            title: 'Profile Updated',
            text: 'Profile updated successfully. Please verify your new email address if updated.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });

    } catch (error) {
        console.error("Update profile error:", error);
        alert("Update profile error: " + error.message);
    }
};

if (window.location.pathname === '/asset/profile.html') {
    const updateProfileBtn = document.getElementById("userProfileBtn");
    updateProfileBtn.addEventListener("click", updateProfile);

    document.addEventListener('DOMContentLoaded', () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            document.getElementById('profileUserName').value = user.name || '';
            document.getElementById('profileEmail').value = user.email || '';
            const img = document.getElementById('UserProfileImg');
            if (user.photoURL) {
                img.src = user.photoURL;
            }
        }
    });
}

// _______________________log-out____________________________

let logOut = () => {
    event.preventDefault();
    signOut(auth).then(() => {
        localStorage.removeItem('user');
        console.log("User logged out.");

        Swal.fire({
            icon: 'success',
            title: 'Logged Out',
            text: 'Your account is successfully logged out.',
            confirmButtonText: 'OK',
        }).then (() => {
                window.location.href = "/index.html";
        });
    })
        .catch((error) => {
            console.error("Logout error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Logout Failed',
                text: 'Error: ' + error.code,
                confirmButtonText: 'OK'
            });
        });
};
if (window.location.pathname === '/asset/profile.html') {
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", logOut)
}

// ______________________________delete-profile______________________

let deleteProfile = async () => {
    event.preventDefault();
    let user = auth.currentUser;
    let userId = auth.currentUser.uid;
    try {
        await deleteUser(user);
        await deleteDoc(doc(db, "users", userId));
        Swal.fire({
            icon: "success",
            title: "Account Deleted",
            text: 'Your account has been successfully deleted.',
            timer: 8000,
            timerProgressBar: true,
        })
            .then(() => {
                window.location.href = "index.html";
            })
    }

    catch (error) {
        alert("Delete button dose not work" + error.message)
    }
}

if (window.location.pathname === "/asset/profile.html") {
    let deleteBtn = document.getElementById('deleteProfileBtn')
    deleteBtn.addEventListener("click", deleteProfile)
}
// ________________________form_____________________________________

let form = async (event) => {
    event.preventDefault();
    // console.log("Publishing blog...");

    let blogTitle = document.getElementById("blogTitle").value;
    let blogCategory = document.getElementById("blogCategory").value;
    let blogContent = document.getElementById("blogContent").value;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("You must be logged in to publish a blog.");
        return;
    }
    const user = JSON.parse(userStr);

    try {
        await addDoc(collection(db, "blogs"), {
            title: blogTitle,
            category: blogCategory,
            content: blogContent,
            userId: user.uid,
            userName: user.name || "Anonymous",
            timestamp: serverTimestamp()
        });
        Swal.fire({
            icon: 'success',
            title: 'Blog Published',
            text: 'Your blog has been published successfully!',
            confirmButtonText: 'OK'
        });
        // Clear the form
        document.getElementById("blogTitle").value = "";
        document.getElementById("blogContent").value = "";
        document.getElementById("blogCategory").selectedIndex = 0;
        // Refresh the post list
        postDisplay();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while adding the blog: ' + error.message,
            confirmButtonText: 'OK'
        });
        console.log("error", error);
    }
};

if (window.location.pathname==='/asset/dashboard.html') {
    let blogForm = document.getElementById("blogForm");
    blogForm.addEventListener("submit", form);

    document.addEventListener('DOMContentLoaded', () => {
        postDisplay();
    });
}
if (window.location.pathname ==='/index.html') {
    document.addEventListener('DOMContentLoaded', () => {
        postDisplay();
    })
}

// ______________post-details_______________________________


let allPosts = [];

let postDisplay = async (filteredPosts = null) => {
    const blogList = document.getElementById('blog-list');
    blogList.innerHTML = "";

    let postsToDisplay = filteredPosts;
    if (!postsToDisplay) {
        try {
            const querySnapshot = await getDocs(collection(db, "blogs"));
            postsToDisplay = [];
            querySnapshot.forEach((docSnap) => {
                postsToDisplay.push({ id: docSnap.id, data: docSnap.data() });
            });
            postsToDisplay.sort((a, b) => b.data.timestamp.toDate() - a.data.timestamp.toDate());
            allPosts = postsToDisplay; 
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            blogList.innerHTML = `<div class="error"><h3>Error loading posts</h3></div>`;
            return;
        }
    }

    if (postsToDisplay.length === 0) {
        blogList.innerHTML = `<div class="no-posts"><h3>No posts found</h3></div>`;
        return;
    }

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    postsToDisplay.forEach(({ id: blogId, data: blog }) => {
        const blogPost = document.createElement('div');
        blogPost.className = 'blog-post';

        const postMeta = document.createElement('div');
        postMeta.className = 'post-meta';

        const authorSpan = document.createElement('span');
        authorSpan.className = 'author';
        authorSpan.textContent = blog.userName || 'Anonymous';

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        const date = blog.timestamp ? blog.timestamp.toDate() : new Date();
        timestampSpan.textContent = date.toLocaleString();

        postMeta.appendChild(authorSpan);
        postMeta.appendChild(timestampSpan);

        const postTitle = document.createElement('div');
        postTitle.className = 'post-title';
        postTitle.textContent = blog.title || '';

        const postCategory = document.createElement('span');
        postCategory.className = 'post-category';
        postCategory.textContent = blog.category || '';

        const postContent = document.createElement('div');
        postContent.className = 'post-content';
        postContent.textContent = blog.content || '';

        blogPost.appendChild(postMeta);
        blogPost.appendChild(postTitle);
        blogPost.appendChild(postCategory);
        blogPost.appendChild(postContent);

        if (currentUser && blog.userId === currentUser.uid) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-post';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                const editModal = document.getElementById('editPostModal');
                const editTitle = document.getElementById('editBlogTitle');
                const editCategory = document.getElementById('editBlogCategory');
                const editContent = document.getElementById('editBlogContent');
                const editForm = document.getElementById('editPostForm');
                const cancelEditBtn = document.getElementById('cancelEditBtn');
                const closeEditModal = document.getElementById('closeEditModal');
                editTitle.value = blog.title || '';
                editCategory.value = blog.category || 'Other';
                editContent.value = blog.content || '';
                editModal.style.display = 'block';
                editForm.dataset.blogId = blogId;
                const closeModal = () => {
                    editModal.style.display = 'none';
                    editForm.removeEventListener('submit', submitHandler);
                    cancelEditBtn.removeEventListener('click', cancelHandler);
                    closeEditModal.removeEventListener('click', closeHandler);
                };

                const submitHandler = async (e) => {
                    e.preventDefault();
                    const updatedTitle = editTitle.value.trim();
                    const updatedCategory = editCategory.value;
                    const updatedContent = editContent.value.trim();

                    if (!updatedTitle || !updatedContent) {
                        alert('Title and content cannot be empty.');
                        return;
                    }

                    try {
                        await updateDoc(doc(db, "blogs", blogId), {
                            title: updatedTitle,
                            category: updatedCategory,
                            content: updatedContent,
                            timestamp: serverTimestamp()
                        });
                        Swal.fire({
                            icon: 'success',
                            title: 'Post Updated',
                            text: 'Your blog post has been updated successfully!',
                            confirmButtonText: 'OK'
                        });
                        closeModal();
                        postDisplay();
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: 'Failed to update post: ' + error.message,
                            confirmButtonText: 'OK'
                        });
                    }
                };
                const cancelHandler = (e) => {
                    e.preventDefault();
                    closeModal();
                };
                const closeHandler = () => {
                    closeModal();
                };
                editForm.addEventListener('submit', submitHandler);
                cancelEditBtn.addEventListener('click', cancelHandler);
                closeEditModal.addEventListener('click', closeHandler);
            });
            blogPost.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-post';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this post?')) {
                    try {
                        await deleteDoc(doc(db, "blogs", blogId))
                        blogPost.remove();
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Your post has been deleted.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        })
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'An error occurred while deleting the post: ' + error.message,
                            confirmButtonText: 'OK'
                        });
                    }
                }
            })
            blogPost.appendChild(deleteBtn);
        }

        blogList.appendChild(blogPost);
    });
};
const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            postDisplay(allPosts);
            return;
        }
        const filtered = allPosts.filter(post => 
            post.data.category.toLowerCase().includes(query) || 
            post.data.title.toLowerCase().includes(query)
        );
        postDisplay(filtered);
    });
};

