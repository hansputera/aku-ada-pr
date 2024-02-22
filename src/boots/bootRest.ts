import { randomUUID } from "node:crypto";
import process from "node:process";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import fastify from "fastify";
import type { Assignment } from "@/entities/assignment.js";
import { AssignmentTypeAsEnum as assignmentTypeAsEnum } from "@/entities/assignment.js";
import { assignmentManager } from "@/managers/assigment.js";

export const bootRest = (): void => {
    const app = fastify().withTypeProvider<TypeBoxTypeProvider>();

    app.get("/", () => "Hello World");

    app.get("/works", async (req, reply) => {
        const withValues = Boolean((req.query as Record<string, string>).withValues);

        const works = await assignmentManager.keys("tugas*");
        return reply.status(200).send(JSON.stringify({
            data: withValues ? await assignmentManager.fetch(...works) : works
        }));
    });

    app.post("/works/:id/complete", {
        schema: {
            params: Type.Object({
                id: Type.String()
            })
        }
    }, async (req, reply) => {
        const keys = await assignmentManager.keys("*_".concat(req.params.id));
        if (keys.length === 0) {
            return reply.status(400).send(JSON.stringify({ ok: false }));
        }

        const result = await assignmentManager.get(keys[0]);
        if (result?.isCompleted ?? false) {
            return reply.status(400).send(JSON.stringify({ ok: false }));
        }

        await assignmentManager.set(keys[0], {
            ...result!,
            isCompleted: true
        });
        return reply.status(200).send(JSON.stringify({ ok: false }));
    });

    app.post("/works", {
        schema: {
            body: Type.Object({
                title: Type.String({ minLength: 1, maxLength: 256 }),
                // eslint-disable-next-line new-cap
                type: Type.Enum(assignmentTypeAsEnum),
                deadline: Type.Date(),
                description: Type.String(),
                // eslint-disable-next-line new-cap
                members: Type.Optional(Type.Array(Type.String()))
            })
        }
    }, async (req, reply) => {
        const keyId = randomUUID();
        await assignmentManager.set(`${req.body.type}_${keyId}`, req.body as Assignment);
        return reply.status(200).send(JSON.stringify({
            data: {
                key: keyId,
                value: req.body
            }
        }));
    });

    app.delete("/:id", {
        schema: {
            params: Type.Object({
                id: Type.String()
            })
        }
    }, async (req, reply) => {
        const keys = await assignmentManager.keys("*_".concat(req.params.id));
        if (keys.length === 0) {
            return reply.status(400).send(JSON.stringify({ ok: false }));
        }

        const result = await assignmentManager.delete(keys[0]);
        if (result) {
            return reply.status(200).send(JSON.stringify({
                ok: true
            }));
        }

        return reply.status(500).send(JSON.stringify({
            ok: false
        }));
    });

    app.listen({
        host: "0.0.0.0",
        port: Number.parseInt(process.env.PORT ?? "3000", 10)
    // eslint-disable-next-line promise/prefer-await-to-callbacks
    }, (err, addr) => {
        if (err) {
            console.error("fastify err", err);
        }
        console.log("Listening to", addr);
    });
};
