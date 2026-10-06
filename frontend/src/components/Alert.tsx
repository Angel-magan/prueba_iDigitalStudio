import React from "react";
import type { AlertProps } from "../types/components";

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const isError = type === "error";
  return (
    <div
      className={`p-4 mb-4 text-sm font-medium rounded-lg border ${
        isError
          ? "text-red-700 bg-red-50 border-red-200"
          : "text-green-700 bg-green-50 border-green-200"
      }`}
      role="alert"
    >
      <span className="font-semibold">{isError ? "Error: " : "Éxito: "}</span>
      {message}
    </div>
  );
};
