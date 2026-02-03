import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SelfAssessment } from "../types";
import Button from "./ui/Button";
import { Eye, X } from "lucide-react";

interface ViewNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Partial<SelfAssessment> | null;
}

const ViewNotesModal: React.FC<ViewNotesModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  if (!assessment) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900 flex items-center"
                >
                  <Eye className="w-6 h-6 mr-3 text-blue-600" />
                  Employee Self-Assessment
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <ReadOnlyField
                    label="Action Taken"
                    value={assessment.action_taken}
                  />
                  <ReadOnlyField
                    label="Accomplishment"
                    value={assessment.accomplishment}
                  />
                  <ReadOnlyField label="Notes" value={assessment.notes} />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onClick={onClose}>
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface ReadOnlyFieldProps {
  label: string;
  value?: string;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="mt-1 p-3 min-h-[80px] w-full bg-gray-50 border border-gray-200 rounded-md text-gray-800 whitespace-pre-wrap">
      {value || (
        <span className="text-gray-400 italic">
          No input provided by employee.
        </span>
      )}
    </div>
  </div>
);

export default ViewNotesModal;
