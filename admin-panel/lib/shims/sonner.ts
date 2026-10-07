type ToastOptions = {
  description?: string;
};

type ToastLevel = "success" | "error";

const TOAST_ID = "artisan-haven-toast";

function removeToast() {
  document.getElementById(TOAST_ID)?.remove();
}

function showToast(level: ToastLevel, message: string, options?: ToastOptions) {
  if (typeof document === "undefined") {
    const detail = options?.description ? ` ${options.description}` : "";
    console[level === "error" ? "error" : "log"](`[toast] ${message}${detail}`);
    return;
  }

  removeToast();

  const toast = document.createElement("div");
  toast.id = TOAST_ID;
  toast.setAttribute("role", "status");
  toast.className =
    level === "error"
      ? "fixed bottom-6 right-6 z-[100] max-w-sm rounded-lg border border-destructive/30 bg-background px-4 py-3 text-sm text-destructive shadow-lg"
      : "fixed bottom-6 right-6 z-[100] max-w-sm rounded-lg border border-primary/30 bg-background px-4 py-3 text-sm text-foreground shadow-lg";

  const title = document.createElement("p");
  title.className = "font-medium";
  title.textContent = message;
  toast.appendChild(title);

  if (options?.description) {
    const description = document.createElement("p");
    description.className = "mt-1 text-muted-foreground";
    description.textContent = options.description;
    toast.appendChild(description);
  }

  document.body.appendChild(toast);
  window.setTimeout(removeToast, 3200);
}

export const toast = {
  success(message: string, options?: ToastOptions) {
    showToast("success", message, options);
  },
  error(message: string, options?: ToastOptions) {
    showToast("error", message, options);
  },
};
