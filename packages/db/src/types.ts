import type { schema } from ".";

export type UsersSelectType = typeof schema.Users.$inferSelect;
export type UsersInsertType = typeof schema.Users.$inferInsert;
export type RepliesSelectType = typeof schema.Replies.$inferSelect;
export type RepliesInsertType = typeof schema.Replies.$inferInsert;
export type CommentsSelectType = typeof schema.Comments.$inferSelect;
export type CommentsInsertType = typeof schema.Comments.$inferInsert;
export type DollarValueSelectType = typeof schema.DollarValue.$inferSelect;
export type DollarValueInsertType = typeof schema.DollarValue.$inferInsert;
export type PaymentsSelectType = typeof schema.Payments.$inferSelect;
export type PaymentsInsertType = typeof schema.Payments.$inferInsert;
export type CarsSelectType = typeof schema.Cars.$inferSelect;
export type CarsInsertType = typeof schema.Cars.$inferInsert;
export type BidsSelectType = typeof schema.Bids.$inferSelect;
export type BidsInsertType = typeof schema.Bids.$inferInsert;
