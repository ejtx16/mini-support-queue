import { useState, FormEvent } from "react";
import { CreateTicketData, Priority, TicketFormErrors } from "../types/ticket";
import "./CreateTicketForm.css";

interface CreateTicketFormProps {
  onSubmit: (data: CreateTicketData) => Promise<boolean>;
  loading: boolean;
}

const TITLE_MIN = 5;
const TITLE_MAX = 80;
const DESC_MIN = 20;
const DESC_MAX = 500;

function validateForm(title: string, description: string, priority: Priority | ""): TicketFormErrors {
  const errors: TicketFormErrors = {};

  if (!title.trim()) {
    errors.title = "Title is required";
  } else if (title.trim().length < TITLE_MIN) {
    errors.title = `Title must be at least ${TITLE_MIN} characters`;
  } else if (title.trim().length > TITLE_MAX) {
    errors.title = `Title must be at most ${TITLE_MAX} characters`;
  }

  if (!description.trim()) {
    errors.description = "Description is required";
  } else if (description.trim().length < DESC_MIN) {
    errors.description = `Description must be at least ${DESC_MIN} characters`;
  } else if (description.trim().length > DESC_MAX) {
    errors.description = `Description must be at most ${DESC_MAX} characters`;
  }

  if (!priority) {
    errors.priority = "Priority is required";
  }

  return errors;
}

export function CreateTicketForm({ onSubmit, loading }: CreateTicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [errors, setErrors] = useState<TicketFormErrors>({});
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    priority: false,
  });

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateForm(title, description, priority);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(title, description, priority);
    setErrors(validationErrors);
    setTouched({ title: true, description: true, priority: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority: priority as Priority,
    });

    if (success) {
      setTitle("");
      setDescription("");
      setPriority("");
      setTouched({ title: false, description: false, priority: false });
      setErrors({});
    }
  };

  return (
    <form id="create-ticket-form" className="create-ticket-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Create New Ticket</h2>

      <div className="form-group">
        <label htmlFor="ticket-title" className="form-label">
          Title
        </label>
        <input
          type="text"
          id="ticket-title"
          name="title"
          className={`form-input ${touched.title && errors.title ? "form-input--error" : ""}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur("title")}
          placeholder="Enter ticket title"
          disabled={loading}
          maxLength={TITLE_MAX}
        />
        <div className="form-input-info">
          <span className={`char-count ${title.length > TITLE_MAX ? "char-count--error" : ""}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        {touched.title && errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="ticket-description" className="form-label">
          Description
        </label>
        <textarea
          id="ticket-description"
          name="description"
          className={`form-textarea ${touched.description && errors.description ? "form-input--error" : ""}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => handleBlur("description")}
          placeholder="Describe the issue in detail"
          disabled={loading}
          maxLength={DESC_MAX}
          rows={4}
        />
        <div className="form-input-info">
          <span className={`char-count ${description.length > DESC_MAX ? "char-count--error" : ""}`}>
            {description.length}/{DESC_MAX}
          </span>
        </div>
        {touched.description && errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Priority</label>
        <div className="priority-options">
          <label className="priority-option">
            <input
              type="radio"
              name="priority"
              value="VIP"
              checked={priority === "VIP"}
              onChange={(e) => setPriority(e.target.value as Priority)}
              onBlur={() => handleBlur("priority")}
              disabled={loading}
            />
            <span className="priority-label priority-label--vip">VIP</span>
          </label>
          <label className="priority-option">
            <input
              type="radio"
              name="priority"
              value="Regular"
              checked={priority === "Regular"}
              onChange={(e) => setPriority(e.target.value as Priority)}
              onBlur={() => handleBlur("priority")}
              disabled={loading}
            />
            <span className="priority-label priority-label--regular">Regular</span>
          </label>
        </div>
        {touched.priority && errors.priority && <span className="form-error">{errors.priority}</span>}
      </div>

      <button type="submit" id="submit-ticket-btn" name="submit-ticket" className="btn btn--primary" disabled={loading}>
      {loading ? "Creating..." : "Create Ticket"}
      </button>
    </form>
  );
}
