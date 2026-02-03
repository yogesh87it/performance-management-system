import React, { useState, Fragment } from "react";
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";
import {
  Building2,
  LayoutDashboard,
  Users,
  Briefcase,
  Target,
  LogOut,
  Menu,
  X,
  UserCheck,
} from "lucide-react";
import { Transition, Popover } from "@headlessui/react";

const AppLayout: React.FC = () => {
  const { employee, company, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNav = [
    {
      name: "Performance Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Company", href: "/admin/company", icon: Building2 },
    { name: "Employees", href: "/admin/employees", icon: Users },
    { name: "Departments", href: "/admin/departments", icon: Briefcase },
    { name: "Designations", href: "/admin/designations", icon: Briefcase },
    { name: "KRA Management", href: "/admin/kra-management", icon: Target },
  ];

  const managerNav = [
    { name: "My Team", href: "/manager/dashboard", icon: Users },
    { name: "KRA Assignment", href: "/manager/kra-assignment", icon: Target },
    { name: "My KRA", href: "/my-kra", icon: UserCheck },
  ];

  const userNav = [{ name: "My KRA", href: "/my-kra", icon: UserCheck }];

  let navItems: { name: string; href: string; icon: React.ElementType }[] = [];
  if (role === Role.Admin) navItems = adminNav;
  else if (role === Role.ReportingManager) navItems = managerNav;
  else if (role === Role.User) navItems = userNav;

  const NavLinks: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => (
    <>
      {navItems.map((item) => (
        <ReactRouterDOM.NavLink
          key={item.name}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            } ${isMobile ? "text-base" : ""}`
          }
        >
          <item.icon className="w-5 h-5" />
          {item.name}
        </ReactRouterDOM.NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Building2 className="h-8 w-8 text-blue-600" />
          <h1 className="ml-3 text-lg font-bold text-gray-800">
            {company?.name || "PMS"}
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm flex items-center justify-between h-16 px-4 lg:px-8">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1"></div>
          <Popover className="relative">
            <Popover.Button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                {employee?.firstname?.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {employee?.firstname} {employee?.lastname}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {role?.replace("_", " ")}
                </p>
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={signOut}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </Popover.Panel>
            </Transition>
          </Popover>
        </header>

        {/* Mobile Menu */}
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <div className="relative z-40 lg:hidden">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>
            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex items-center h-16 px-4 border-b border-gray-200">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <h1 className="ml-3 text-lg font-bold text-gray-800">
                      {company?.name || "PMS"}
                    </h1>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    <NavLinks isMobile />
                  </nav>
                </div>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" />
            </div>
          </div>
        </Transition.Root>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ReactRouterDOM.Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
