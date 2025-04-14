import React, { useState } from "react";
import { supabase } from "@backend/services/supabaseClient";
import { toast } from "react-toastify";

const CreateTask = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Low",
    });

    const [formLoading, setFormLoading] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        if (!formData.title) {
            toast.error("Title is required.");
            setFormLoading(false);
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (formData.dueDate && formData.dueDate < today) {
            toast.error("Due date must be today or a future date.");
            setFormLoading(false);
            return;
        }

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;
            const user = userData?.user;

            if (!user) throw new Error("You must be logged in to create a task.");

            const { data, error } = await supabase
                .from("tasks")
                .insert({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    due_date: formData.dueDate,
                    priority: formData.priority,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;

            if (!data) {
                toast.error("Task creation failed.");
                return;
            }

            toast.success("Task created successfully!");
            setFormData({ title: "", description: "", dueDate: "", priority: "Low" });

        } catch (error) {
            toast.error(error.message || "An unexpected error occurred.");
            console.error("Error creating task:", error);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>

            <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                        required
                        placeholder="Enter task title"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                        placeholder="Enter task description"
                        rows="3"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                        disabled={formLoading}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleFormChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#60A5FA]"
                        disabled={formLoading}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => setFormData({ title: "", description: "", dueDate: "", priority: "Low" })}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        disabled={formLoading}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#60A5FA] text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={formLoading}
                    >
                        {formLoading ? "Creating..." : "Create Task"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTask;
