"use client";

import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";

type FilterToggleProps = {
    title: string;
    description: string;
    checked: boolean;
    onChange: () => void;
};

export default function FilterToggle({ title, description, checked, onChange }: FilterToggleProps) {
    return (
        <section className="rounded-2xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {title}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600 dark:text-white/50">
                        {description}
                    </div>
                </div>
                <Switch
                    checked={checked}
                    onChange={onChange}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-black",
                        checked ? "bg-black/70 dark:bg-white/25" : "bg-black/10 dark:bg-white/10"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-4 w-4 transform rounded-full transition-transform",
                            "bg-white dark:bg-black",
                            checked ? "translate-x-6" : "translate-x-1"
                        )}
                    />
                </Switch>
            </div>
        </section>
    );
}
