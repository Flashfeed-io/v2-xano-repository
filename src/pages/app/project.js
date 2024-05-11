import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";

const store = reactive({
  isAccepting: false,
  proposals: [],
  isAwaiting: false
});

const getProposals = async (id) => {
  const response = await fetch(
    "https://live.api-server.io/run/v1/633dae32950ced8fbbc73b5a?project_id=" +
      id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken()
      }
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data;
};

const mounted = async () => {
  store.proposals = await getProposals(window.airtableId);
  store.isAwaiting = window.isProjectAwaitingApplications;
  window.console.log("Mounted");
};

const getBackgroundStyle = (url) => {
  let styles = {};
  if (url !== "") {
    styles = { backgroundImage: `url(${url})` };
  }
  return styles;
};

const acceptProposal = async (proposal) => {
  store.isAccepting = true;
  const response = await fetch(
    "https://hook.us1.make.com/0sk3414rcomxuy2et8f3pcm6jm2vmebq",
    {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(proposal)
    }
  ).catch((error) => {
    alert("Error, unable to accept proposal.");
    store.isAccepting = false;
    throw new Error(error.message);
  });

  if (response.ok) {
    await new Promise((r) => setTimeout(r, 3000));
    window.location.reload();
  } else {
    const message = `An error has occured: ${response.status}`;
    store.isAccepting = false;
    throw new Error(message);
  }
};

const app = createApp({
  // exposed to all expressions
  mounted,
  getBackgroundStyle,
  acceptProposal,
  store
});

export { app };
