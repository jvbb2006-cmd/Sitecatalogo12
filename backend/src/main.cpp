/**
 * Dealership REST API in C++17 using Crow framework and SQLite3
 * Concessionária de Veículos - API REST C++17
 */

#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <sstream>
#include <sqlite3.h>

// Crow single-header or library include
#if __has_include(<crow.h>)
#include <crow.h>
#else
#include "crow_all.h"
#endif

// SQLite Database Helper
class Database {
public:
    explicit Database(const std::string& dbPath) {
        if (sqlite3_open(dbPath.c_str(), &db_) != SQLITE_OK) {
            std::cerr << "Falha ao abrir SQLite: " << sqlite3_errmsg(db_) << std::endl;
        } else {
            std::cout << "Banco de dados SQLite conectado: " << dbPath << std::endl;
        }
    }

    ~Database() {
        if (db_) sqlite3_close(db_);
    }

    sqlite3* get() const { return db_; }

private:
    sqlite3* db_ = nullptr;
};

int main() {
    crow::SimpleApp app;
    Database db("dealership.sqlite");

    // Health check endpoint
    CROW_ROUTE(app, "/api/health")
    ([]() {
        crow::json::wvalue res;
        res["status"] = "ok";
        res["service"] = "AutoPrime C++ Crow Server";
        return res;
    });

    // List vehicles endpoint
    CROW_ROUTE(app, "/api/vehicles")
    ([&db](const crow::request& req) {
        crow::json::wvalue res;
        std::vector<crow::json::wvalue> vehiclesList;

        const char* sql = "SELECT id, marca, modelo, versao, categoria, ano_fabricacao, ano_modelo, km, combustivel, cambio, cor, portas, placa_final, preco, preco_promocional, status, condicao, destaque, em_oferta, cover_image, descricao FROM vehicles WHERE deleted_at IS NULL ORDER BY destaque DESC, id DESC;";
        sqlite3_stmt* stmt;

        if (sqlite3_prepare_v2(db.get(), sql, -1, &stmt, nullptr) == SQLITE_OK) {
            int idx = 0;
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                crow::json::wvalue v;
                v["id"] = sqlite3_column_int(stmt, 0);
                v["marca"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
                v["modelo"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
                v["versao"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
                v["categoria"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
                v["ano_fabricacao"] = sqlite3_column_int(stmt, 5);
                v["ano_modelo"] = sqlite3_column_int(stmt, 6);
                v["km"] = sqlite3_column_int(stmt, 7);
                v["combustivel"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
                v["cambio"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 9));
                v["cor"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 10));
                v["portas"] = sqlite3_column_int(stmt, 11);
                v["placa_final"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 12));
                v["preco"] = sqlite3_column_double(stmt, 13);
                v["preco_promocional"] = sqlite3_column_double(stmt, 14);
                v["status"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 15));
                v["condicao"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 16));
                v["destaque"] = sqlite3_column_int(stmt, 17);
                v["em_oferta"] = sqlite3_column_int(stmt, 18);
                v["cover_image"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 19));
                v["descricao"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 20));

                vehiclesList.push_back(std::move(v));
                idx++;
            }
            sqlite3_finalize(stmt);
        }

        res["total"] = static_cast<int>(vehiclesList.size());
        res["vehicles"] = std::move(vehiclesList);
        return res;
    });

    // Company Config endpoint
    CROW_ROUTE(app, "/api/config")
    ([&db]() {
        crow::json::wvalue res;
        const char* sql = "SELECT * FROM company_settings WHERE id = 1;";
        sqlite3_stmt* stmt;

        if (sqlite3_prepare_v2(db.get(), sql, -1, &stmt, nullptr) == SQLITE_OK) {
            if (sqlite3_step(stmt) == SQLITE_ROW) {
                crow::json::wvalue cfg;
                cfg["nome"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
                cfg["slogan"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
                cfg["telefone"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
                cfg["whatsapp"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 7));
                cfg["email"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 8));
                cfg["endereco"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 9));
                cfg["cidade_estado"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 10));
                cfg["horario_atendimento"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 11));
                res["config"] = std::move(cfg);
            }
            sqlite3_finalize(stmt);
        }
        return res;
    });

    // Contacts / Leads endpoint
    CROW_ROUTE(app, "/api/contacts").methods(crow::HTTPMethod::POST)
    ([&db](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "JSON inválido");

        const char* sql = "INSERT INTO contacts (tipo, nome, telefone, email, veiculo_id, veiculo_nome, valor_entrada, parcelas, veiculo_troca, mensagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        sqlite3_stmt* stmt;

        if (sqlite3_prepare_v2(db.get(), sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, body["tipo"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, body["nome"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 3, body["telefone"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 4, body["email"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_null(stmt, 5);
            sqlite3_bind_text(stmt, 6, body["veiculo_nome"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_double(stmt, 7, body["valor_entrada"].d());
            sqlite3_bind_int(stmt, 8, body["parcelas"].i());
            sqlite3_bind_text(stmt, 9, body["veiculo_troca"].s().data(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 10, body["mensagem"].s().data(), -1, SQLITE_TRANSIENT);

            sqlite3_step(stmt);
            sqlite3_finalize(stmt);
        }

        crow::json::wvalue res;
        res["success"] = true;
        res["message"] = "Lead registrado com sucesso";
        return crow::response(res);
    });

    std::cout << "Iniciando servidor C++ Crow na porta 8080..." << std::endl;
    app.port(8080).multithreaded().run();
    return 0;
}
