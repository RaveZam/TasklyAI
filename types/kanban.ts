export type Status = "todo" | "inProgress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: "Low" | "Medium" | "High";
  due: string;
};

