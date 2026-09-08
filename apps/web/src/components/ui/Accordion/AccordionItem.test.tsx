import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AccordionItem } from "./AccordionItem";
import { MultipleAccordion } from "./MultipleAccordion";

describe("AccordionItem", () => {
  it("starts collapsed by default and reports its expanded state", async () => {
    render(
      <MultipleAccordion>
        <AccordionItem title="Areas">
          <p>Saved areas</p>
        </AccordionItem>
        <AccordionItem title="Venues">
          <p>Saved venues</p>
        </AccordionItem>
      </MultipleAccordion>,
    );

    const trigger = screen.getByRole("button", { name: "Areas" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
