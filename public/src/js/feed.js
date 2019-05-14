var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
const form = document.querySelector("form");
const titleInput = document.querySelector("#title");
const locatinInput = document.querySelector("#location");

function openCreatePostModal() {
  createPostArea.style.display = "block";
  setTimeout(() => {
    createPostArea.style.transform = "translateY(0)";
  }, 1);

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
  createPostArea.style.transform = "translateY(100vh)";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function(cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = "cover";

  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var url = "https://pwagram-bd625.firebaseio.com/Posts.json";
var networkDataReceived = false;
const updateUI = data => {
  clearCards();
  return data.map(item => createCard(item));
};
const sendData = () => {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        "https://firebasestorage.googleapis.com/v0/b/pwagram-bd625.appspot.com/o/sf-boat.jpg?alt=media&token=08384d28-9742-4460-b661-d6b99a7d5648"
    })
  }).then(data => {
    console.log("sent data: ", data);
    updateUI();
  });
};

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log("From web", data);
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }

    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then(data => {
    if (!networkDataReceived) {
      console.log("From cache: ", data);
      updateUI(data);
    }
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (title.value.trim() === "" || location.value.trim() === "") {
    alert("please enter valid data");
    return;
  }
  closeCreatePostModal();
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(sw => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value
      };
      writeData("sync-posts", post)
        .then(() => {
          return sw.sync.register("sync-new-post");
        })
        .then(() => {
          let snackbarContainer = document.querySelector("#confirmation-toast");
          const data = {message: "Your Post was saved for syncing"};
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(err => console.log(err));
    });
  } else {
    sendData();
  }
});
