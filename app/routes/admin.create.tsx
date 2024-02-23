// import { ActionFunction, json, redirect } from "@remix-run/cloudflare";
// import { Form } from "@remix-run/react";
// import { Env } from "~/types";

// export const action: ActionFunction = async ({ request, context }) => {
//   const env = context.env as Env;
//   const body = await request.formData();
//   const name = body.get("name");
//   const link = body.get("link");
//   const memo = body.get("memo");

//   if (name && link) {
//     const data = await env.DB.prepare("INSERT INTO dishes VALUES(?, ?, ?);")
//       .bind(name, link, memo)
//       .run();
//     if (data.error) {
//       return json({ success: false, message: data.error }, { status: 500 });
//     }

//     return redirect("/admin");
//   } else {
//     return json({ success: false }, { status: 400 });
//   }
// };

// export default function AdminCreate() {
//   return (
//     <Form method="POST">
//       <div>
//         <label htmlFor="dish_name">Name</label>
//         <input id="name" type="text" />
//       </div>
//       <div>
//         <label htmlFor="dish_link">Link</label>
//         <input id="link" type="url" />
//       </div>
//       <div>
//         <label htmlFor="dish_memo">Memo</label>
//         <input id="memo" type="text" multiple />
//       </div>
//       <button type="submit">Sumbit</button>
//     </Form>
//   );
// }

export default function AdminCreate() {
    return <div>wip</div>
}
