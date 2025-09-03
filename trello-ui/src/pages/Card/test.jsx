<div className="mb-4">
<p className="d-flex align-items-center mb-2">
	<Icon icon="material-symbols:checklist" width={20} />
	<span className="ps-2">Checklist</span>
</p>

<div className="border border-secondary rounded px-3 py-2 bg-dark text-white">
	<div className="d-flex align-items-center mb-2">
		<div className="small text-white me-auto">{progress}%</div>
		<div style={{ flex: 1, margin: "0 8px" }}>
			<div
				style={{
					height: 8,
					background: "#2b2f31",
					borderRadius: 8,
				}}
			>
				<div
					style={{
						width: `${progress}%`,
						height: 8,
						background: "#6ea8fe",
						borderRadius: 8,
					}}
				/>
			</div>
		</div>
		<button className="btn btn-sm btn-secondary ms-2" onClick={() => setHideChecked((s) => !s)}>
			{hideChecked ? "Show checked items" : "Hide checked items"}
		</button>
		<button className="btn btn-sm btn-danger ms-2" onClick={handleDeleteChecked}>
			Delete
		</button>
	</div>

	{tasks.length === 0 ? (
		<div className="text-white">No tasks for this card</div>
	) : (
		<div className="d-flex flex-column" style={{ gap: 8 }}>
			{tasks
				.filter((t) => (hideChecked ? !t.completed : true))
				.map((t) => (
					<div key={t.id} className="p-2 border rounded bg-secondary d-flex justify-content-between align-items-center">
						<div className="d-flex align-items-center gap-2">
							<input type="checkbox" checked={!!t.completed} onChange={() => handleToggle(t)} />
							<div>
								<div
									className="fw-bold"
									style={{
										textDecoration: t.completed ? "line-through" : "none",
										opacity: t.completed ? 0.6 : 1,
									}}
								>
									{t.title}
								</div>
								{t.description && <div className="small text-muted">{t.description}</div>}

								{/* show due date if present */}
								{t.dueDate && <div className="small text-warning">Due: {new Date(t.dueDate).toLocaleDateString()}</div>}

								{/* show assigned avatars / initials for multiple assignees */}
							</div>
						</div>
						<div className="d-flex align-items-center gap-2">
							<div className="d-flex gap-1">
								{(Array.isArray(t.assignedTo) ? t.assignedTo : []).slice(0, 5).map((a, idx) => {
									const mem = boardMembers.find((m) => String(m.id || m._id || m.uid || m.name || m.email) === String(a));

									const label = mem?.username || mem?.name || mem?.displayName || mem?.email || a;
									const initial = label.charAt(0).toUpperCase();

									return (
										<div
											key={idx}
											className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center"
											style={{ width: 25, height: 25, fontSize: 12 }}
											title={label}
										>
											{initial}
										</div>
									);
								})}
							</div>

							<div className="d-flex align-items-center gap-2">
								{/* Edit */}
								<button
									className="d-flex align-items-center justify-content-center"
									title="Edit task"
									onClick={(e) => {
										e.stopPropagation();
										startEdit(t);
									}}
									style={{
										cursor: "pointer",
										border: "none",
										background: "transparent",
										color: "#fff",
										// borderRadius: "6px",
										borderLeft: "1px solid #fff", // gạch phân tách
										paddingLeft: "12px",
										borderRight: "1px solid #fff", // gạch phân tách
										paddingRight: "12px",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "rgba(13,110,253,0.1)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "transparent";
									}}
								>
									<Icon icon="material-symbols:edit-outline" width={22} />
								</button>

								{/* Delete */}
								<button
									className="d-flex align-items-center justify-content-center p-1"
									title="Delete task"
									onClick={(e) => {
										e.stopPropagation();
										handleDelete(t.id);
									}}
									style={{
										cursor: "pointer",
										border: "none",
										background: "transparent",
										color: "#fff", // đỏ bootstrap
										borderRadius: "6px",
										transition: "all 0.2s ease",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = "rgba(220,53,69,0.1)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "transparent";
									}}
								>
									<Icon icon="material-symbols:delete-outline" width={22} />
								</button>
							</div>
						</div>
					</div>
				))}

			{/* Inline editor for task */}
			{editingTaskId && (
				<div className="p-2">
					{tasks
						.filter((x) => x.id === editingTaskId)
						.map((task) => (
							<div key={task.id} className="border p-2 rounded bg-dark">
								<input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="form-control mb-2 bg-dark text-white border-secondary" />

								<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
									<div className="mb-2 d-flex align-items-center gap-2 position-relative">
										<button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEditAssignPicker((s) => !s)}>
											<Icon icon="material-symbols:person" width={16} /> Assign
										</button>
										{showEditAssignPicker && (
											<div
												className="position-absolute"
												style={{
													top: "105%",
													left: 0,
													zIndex: 2000,
													background: "#1d2125",
													border: "1px solid #444",
													padding: 8,
													borderRadius: 6,
													minWidth: 220,
												}}
											>
												{(boardMembers || []).map((m) => {
													const mid = m.id || m._id || m.uid || m.name || m.email;
													const checked = editAssigned.includes(mid);

													const label = m.username || m.name || m.displayName || m.email || mid;
													const initial = getInitial(label);

													return (
														<div
															key={mid}
															className="d-flex align-items-center gap-2 p-1 rounded"
															style={{
																cursor: "pointer",
																background: checked ? "#2b2f31" : "transparent",
															}}
															onClick={() => {
																if (checked) {
																	setEditAssigned((prev) => prev.filter((p) => p !== mid));
																} else {
																	setEditAssigned((prev) => [...prev, mid]);
																}
															}}
														>
															<div
																className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
																style={{ width: 28, height: 28, fontSize: 13 }}
															>
																{initial}
															</div>
															<span className="text-white small">{label}</span>
														</div>
													);
												})}
											</div>
										)}

										<div className="position-relative">
											<button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEditDuePicker((s) => !s)}>
												<Icon icon="material-symbols:schedule" width={16} /> Due date
											</button>
											{showEditDuePicker && (
												<div
													className="position-absolute"
													style={{
														top: "105%",
														left: 0,
														zIndex: 2000,
														background: "#1d2125",
														border: "1px solid #444",
														padding: 8,
														borderRadius: 6,
													}}
												>
													<input
														type="date"
														value={editDueDate}
														onChange={(e) => setEditDueDate(e.target.value)}
														className="form-control form-control-sm bg-dark text-white border-secondary"
													/>
												</div>
											)}
										</div>
									</div>

									<div className="d-flex gap-2">
										<button className="btn btn-sm btn-primary" onClick={() => saveEdit(task.id)}>
											Save
										</button>
										<button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
											Cancel
										</button>
									</div>
								</div>
							</div>
						))}
				</div>
			)}
		</div>
	)}

	<div className="mt-3">
		<div className="d-flex flex-column" style={{ gap: 8 }}>
			<input
				value={newTaskTitle}
				onChange={(e) => setNewTaskTitle(e.target.value)}
				className="form-control form-control-sm bg-dark text-white border-secondary"
				placeholder="Add an item"
			/>

			<div className="d-flex align-items-center justify-content-between mt-2">
				<div className="d-flex gap-2">
					<button className="btn btn-sm btn-primary" onClick={handleAddTask}>
						Save
					</button>
					<button
						className="btn btn-sm btn-outline-secondary"
						onClick={() => {
							setNewTaskTitle("");
							setNewAssigned([]);
							setNewDueDate("");
							setShowAssignPicker(false);
							setShowDuePicker(false);
						}}
					>
						Cancel
					</button>
				</div>

				<div className="d-flex align-items-center gap-2 position-relative">
					<button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAssignPicker((s) => !s)}>
						<Icon icon="material-symbols:person" width={16} /> Assign
					</button>
					{showAssignPicker && (
						<div
							className="position-absolute"
							style={{
								top: "105%",
								right: 0,
								zIndex: 2000,
								background: "#1d2125",
								border: "1px solid #444",
								padding: 8,
								borderRadius: 6,
								minWidth: 220,
							}}
						>
							{(boardMembers || []).map((m) => {
								const mid = m.id || m._id || m.uid || m.name || m.email;
								const isSelected = newAssigned.includes(mid);

								const label = m.username || m.name || m.displayName || m.email || mid;
								const initial = getInitial(label);

								return (
									<div
										key={mid}
										className="d-flex align-items-center gap-2 p-1 rounded"
										style={{
											cursor: "pointer",
											background: isSelected ? "#2b2f31" : "transparent",
										}}
										onClick={() => {
											if (isSelected) {
												setNewAssigned((prev) => prev.filter((p) => p !== mid));
											} else {
												setNewAssigned((prev) => [...prev, mid]);
											}
										}}
									>
										<div
											className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
											style={{ width: 28, height: 28, fontSize: 13 }}
										>
											{initial}
										</div>
										<span className="text-white small">{label}</span>
									</div>
								);
							})}
						</div>
					)}

					<div className="position-relative">
						<button className="btn btn-sm btn-outline-secondary" onClick={() => setShowDuePicker((s) => !s)}>
							<Icon icon="material-symbols:schedule" width={16} />
						</button>
						{showDuePicker && (
							<div
								className="position-absolute"
								style={{
									top: "105%",
									right: 0,
									zIndex: 2000,
									background: "#1d2125",
									border: "1px solid #444",
									padding: 8,
									borderRadius: 6,
								}}
							>
								<input
									type="date"
									value={newDueDate}
									onChange={(e) => setNewDueDate(e.target.value)}
									className="form-control form-control-sm bg-dark text-white border-secondary"
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</div>