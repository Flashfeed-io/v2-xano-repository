import { $fetch } from "ohmyfetch";
import { createApp, reactive } from "petite-vue";

const store = reactive({
  memberObject: {},
  member_id: "",
});

MemberStack.onReady.then(function (member) {
  store.member_id = member.id;
  console.log("Checking -> : vue ms test", store.member_id);
});

const getMemberData = async () => {
  console.log("Checking -> store.member_id", store.member_id);
  const response = await fetch(
    "https://x6c9-ohwk-nih4.n7d.xano.io/api:QLDf95Yy/user/" + store.member_id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + MemberStack.getToken(),
      },
    }
  ).catch((error) => {
    throw new Error(error.message);
  });

  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  console.log("Checking -> : data", data);
  return data;
};

const mounted = async () => {
  store.memberObject = await getMemberData();
  console.log("Checking -> memberObject:", store.memberObject);
  window.console.log("Mounted");
};

const app = createApp({
  // exposed to all expressions
  mounted,
  store,
  getMemberData,
});

export { app };
