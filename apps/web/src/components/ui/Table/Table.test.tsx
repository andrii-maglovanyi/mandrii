import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Table } from "./Table";

describe("Table", () => {
  const columns = [
    {
      defaultSortOrder: "desc" as const,
      key: "status",
      sorter: true,
      title: "Status",
    },
    {
      key: "title",
      sorter: true,
      title: "Title",
    },
  ];

  it("makes the clicked column the primary sort instead of retaining default sorts ahead of it", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();

    render(
      <Table
        columns={columns}
        dataSource={[{ id: "1", status: "ACTIVE", title: "First" }]}
        onSort={onSort}
        rowKey="id"
      />,
    );

    await user.click(screen.getByRole("columnheader", { name: "Title" }));

    expect(onSort).toHaveBeenLastCalledWith([{ title: "asc" }]);

    await user.click(screen.getByRole("columnheader", { name: "Title" }));

    expect(onSort).toHaveBeenLastCalledWith([{ title: "desc" }]);
  });
});
